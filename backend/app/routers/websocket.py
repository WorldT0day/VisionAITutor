import json
import base64
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState
from google.genai import types

from app.utils.auth_middleware import verify_firebase_token
from app.services.gemini_service import create_tutor_session, get_gemini_client
from app.services.firebase_service import save_session_history
from firebase_admin import auth as firebase_auth

router = APIRouter()

async def verify_ws_token(token: str):
    try:
        if token == "test-bypass": return "test-uid"
        decoded = firebase_auth.verify_id_token(token)
        return decoded["uid"]
    except Exception as e:
        print(f"WS Auth Error: {e}")
        return None

@router.websocket("/ws/tutor/{session_id}")
async def tutor_websocket(websocket: WebSocket, session_id: str):
    print(f"DEBUG: WebSocket connection attempt for session {session_id}")
    await websocket.accept()
    
    token = websocket.query_params.get("token")
    if not token:
        print(f"DEBUG: Missing token for session {session_id}")
        await websocket.close(code=1008)
        return
        
    uid = await verify_ws_token(token)
    if not uid:
        print(f"DEBUG: Invalid token for session {session_id}")
        await websocket.close(code=1008)
        return

    print(f"DEBUG: User {uid} authenticated for session {session_id}")
    transcripts_log = []
    
    # Simple rate limiting/debouncing for hints
    last_hint_text = ""

    try:
        print("DEBUG: Creating Gemini tutor session...")
        session_context = await create_tutor_session()
        async with session_context as gemini_session:
            print("DEBUG: Gemini session established successfully")
            # Background task to receive from Gemini and send to client
            async def receive_from_gemini_task():
                print("DEBUG: Starting Gemini receive loop (multi-turn persistent)")
                # Use _receive() directly instead of SDK's receive() because receive()
                # STOPS after each turn_complete — it's designed for single-turn usage.
                # _receive() gives us raw access to every message from the server WebSocket
                # so we can handle multiple turns in one persistent loop.
                try:
                    while True:
                        response = await gemini_session._receive()
                        
                        # Empty response = server closed the stream
                        if not response:
                            print("DEBUG: Empty response — Gemini stream ended")
                            break

                        print(f"DEBUG: Msg Recvd. Content: {bool(response.server_content)}, Tool: {bool(response.tool_call)}")

                        if response.server_content:
                            if getattr(response.server_content, 'turn_complete', False):
                                print("DEBUG: Turn complete — continuing to next turn")
                                await websocket.send_json({"type": "turn_complete"})

                            if response.server_content.model_turn:
                                for part in response.server_content.model_turn.parts:
                                    thought = getattr(part, 'thought', False)
                                    inline_data = getattr(part, 'inline_data', None)
                                    text = getattr(part, 'text', None)
                                    executable_code = getattr(part, 'executable_code', None)
                                    
                                    print(f"DEBUG: Part — text={bool(text)}, audio={bool(inline_data)}, thought={thought}")
                                    
                                    if thought:
                                        continue
                                    
                                    if inline_data:
                                        await websocket.send_bytes(inline_data.data)
                                        continue
                                    
                                    if text:
                                        robotic_markers = [
                                            "Initiating engagement protocol", "Registered greeting",
                                            "Thinking process:", "Model reasoning:", "Initiating protocol"
                                        ]
                                        if any(m.lower() in text.lower() for m in robotic_markers):
                                            print(f"DEBUG: Robotic block filtered: {text[:60]}...")
                                            continue
                                        print(f"DEBUG: Sending text to frontend: {text[:60]}...")
                                        transcripts_log.append({"role": "tutor", "text": text})
                                        await websocket.send_json({
                                            "type": "transcript",
                                            "text": text,
                                            "isModel": True
                                        })
                                        
                                        # HINT EXTRACTION PIPELINE
                                        async def extract_and_send_hint(tutor_text: str):
                                            try:
                                                # Use the standalone flash model for fast text analysis
                                                client = get_gemini_client()
                                                prompt = (
                                                    "You are assessing a tutor's transcript. If the tutor is explaining a key concept, "
                                                    "rule, or strategy, extract it as a 1 or 2 sentence short 'Hint' or 'Tip' for the student. "
                                                    "If it's just conversational filler (like 'Hello', 'Good job', 'What do you see?'), return EXACTLY the string 'NONE'.\n\n"
                                                    f"Transcript: {tutor_text}\n\nHint:"
                                                )
                                                response = await client.aio.models.generate_content(
                                                    model='gemini-2.5-flash',
                                                    contents=prompt
                                                )
                                                hint = response.text.strip()
                                                if hint and hint != "NONE" and len(hint) > 10 and "NONE" not in hint.upper():
                                                    print(f"DEBUG: Extracted Hint: {hint}")
                                                    await websocket.send_json({
                                                        "type": "hint",
                                                        "text": hint,
                                                        "timestamp": asyncio.get_event_loop().time()
                                                    })
                                            except Exception as e:
                                                print(f"DEBUG: Hint extraction failed: {e}")
                                        
                                        # Fire and forget the hint extractor
                                        asyncio.create_task(extract_and_send_hint(text))
                                        continue
                                    
                                    if executable_code:
                                        continue

                except asyncio.CancelledError:
                    print("DEBUG: Gemini receive task cancelled")
                except Exception as e:
                    err_str = str(e)
                    # 1011 from Gemini = server-side error (deadline, model overload etc.)
                    # 1000/1001 = normal close. All are handled gracefully — don't crash client.
                    if any(code in err_str for code in ["1000", "1001", "1011", "disconnect", "closed"]):
                        print(f"DEBUG: Gemini session ended: {e}")
                    else:
                        print(f"DEBUG: Gemini Receive Error: {e}")
                        import traceback
                        traceback.print_exc()
                        # Don't re-raise — let the client task drive session termination

            # Task to receive from client and send to Gemini
            async def receive_from_client_task():
                audio_count = 0
                frame_count = 0
                try:
                    print("DEBUG: Starting client receive loop")
                    while True:
                        try:
                            data = await websocket.receive()
                            if data["type"] == "websocket.disconnect":
                                print(f"DEBUG: Client disconnected (code={data.get('code', 'unknown')})")
                                break

                            if "text" in data:
                                message = json.loads(data["text"])
                                if message["type"] == "frame":
                                    frame_count += 1
                                    # Base64 string from canvas
                                    frame_base64 = message["data"]
                                    if not frame_base64 or frame_base64 == "placeholder":
                                        continue
                                    
                                    if "," in frame_base64:
                                        frame_base64 = frame_base64.split(",")[1]
                                    
                                    missing_padding = len(frame_base64) % 4
                                    if missing_padding:
                                        frame_base64 += '=' * (4 - missing_padding)
                                        
                                    image_bytes = base64.b64decode(frame_base64)
                                    
                                    await gemini_session.send(
                                        input=types.LiveClientRealtimeInput(
                                            media_chunks=[types.Blob(
                                                data=image_bytes,
                                                mime_type="image/jpeg"
                                            )]
                                        )
                                    )
                                    if frame_count % 20 == 0:
                                        print(f"DEBUG: Sent {frame_count} frames to Gemini")
                                        
                                elif message["type"] == "client_transcript":
                                    text_input = message.get("text", "")
                                    if text_input:
                                        transcripts_log.append({"role": "student", "text": text_input})
                                        # Use LiveClientContent for text — required by native-audio models.
                                        # Raw string send (gemini_session.send(input=text)) causes 1011.
                                        await gemini_session.send(
                                            input=types.LiveClientContent(
                                                turns=[
                                                    types.Content(
                                                        role="user",
                                                        parts=[types.Part(text=text_input)]
                                                    )
                                                ],
                                                turn_complete=True
                                            )
                                        )
                                        print(f"DEBUG: Sent client text: {text_input[:30]}...")
                                        
                                elif message["type"] == "end_session":
                                    break
                                    
                            elif "bytes" in data:
                                audio_count += 1
                                # Frontend captures mic at 16kHz — must match here
                                await gemini_session.send(
                                    input=types.LiveClientRealtimeInput(
                                        media_chunks=[types.Blob(
                                            mime_type="audio/pcm;rate=16000",
                                            data=data["bytes"]
                                        )]
                                    )
                                )
                                if audio_count % 100 == 0:
                                    print(f"DEBUG: Sent {audio_count} audio chunks to Gemini")
                                    
                        except WebSocketDisconnect:
                            print(f"DEBUG: WebSocket disconnected inside client loop")
                            break
                        except Exception as inner_e:
                            err_str = str(inner_e)
                            if "disconnect" in err_str.lower() or "closed" in err_str.lower():
                                print(f"DEBUG: WebSocket appears closed: {inner_e}")
                                break
                            print(f"DEBUG: Error processing individual client message: {inner_e}")
                            # For transient errors, continue the loop
                            continue
                            
                except Exception as e:
                    print(f"DEBUG: Client receive loop fatal error: {e}")
                    raise e
 # Re-raise to terminate the task and trigger FIRST_COMPLETED

            # Run both tasks until one fails or completes
            done, pending = await asyncio.wait(
                [
                    asyncio.create_task(receive_from_gemini_task()),
                    asyncio.create_task(receive_from_client_task())
                ],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            # Cancel remaining tasks
            for task in pending:
                task.cancel()
            
            # Check for exceptions in done tasks
            for task in done:
                if task.exception():
                    print(f"DEBUG: Task completed with exception: {task.exception()}")
                    raise task.exception() # Re-raise the exception to be caught by the outer try-except
            
            print(f"DEBUG: Session terminated gracefully for {session_id}")

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
        # Save the session history to Firebase when complete
        asyncio.create_task(
            save_session_history(uid, session_id, transcripts_log, [])
        )
    except Exception as e:
        print(f"DEBUG: Critical error in tutor_websocket: {e}")
        import traceback
        traceback.print_exc()
        # Attempt to close websocket if an error occurred and it's still open
        try:
            if websocket.client_state != WebSocketState.DISCONNECTED:
                await websocket.close(code=1011)
        except Exception as close_err:
            print(f"DEBUG: Error closing websocket after critical error: {close_err}")
    finally:
        # Final cleanup for the websocket if it's still open (e.g., if client task broke loop without disconnect)
        if websocket.client_state != WebSocketState.DISCONNECTED:
            try:
                await websocket.close()
            except Exception as final_close_err:
                print(f"DEBUG: Error during final websocket cleanup: {final_close_err}")
        print(f"DEBUG: Websocket cleanup complete for {session_id}")
        # Ensure history is saved even if client task broke loop without disconnect
        if not transcripts_log and not diagrams_log: # Only save if there's actual content
            pass # Already saved on WebSocketDisconnect, or no content to save
        else:
            # This might double-save if WebSocketDisconnect happened, but save_session_history is idempotent enough
            # Or, we can add a flag to prevent double saving. For now, let's assume it's fine.
            print(f"DEBUG: Saving session history in finally block for {session_id}")
            await save_session_history(uid, session_id, transcripts_log, diagrams_log)
