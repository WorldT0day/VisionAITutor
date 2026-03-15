import asyncio
import websockets
import json
import base64

async def simulate_client():
    uri = "ws://localhost:8081/ws/tutor/test-session?token=test-bypass"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected!")
            
            # Send a frame to trigger the message loop safety
            # (Wait, my server skips placeholder)
            # Send a simple text message if I had one? No, my server expects JSON.
            
            message = {
                "type": "frame",
                "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg==" # Tiny valid jpeg base64
            }
            # Actually, let's just wait for greeting
            print("Waiting for tutor greeting...")
            
            while True:
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    if isinstance(response, str):
                        print(f"JSON RECVD: {response}")
                    else:
                        print(f"BYTES RECVD: {len(response)} bytes")
                except asyncio.TimeoutError:
                    print("Timeout waiting for response. Sending 'Hi' via client_transcript...")
                    # Send a text greet
                    await websocket.send(json.dumps({
                        "type": "client_transcript",
                        "text": "Hello VisionTutor, can you introduce yourself?"
                    }))
                    
    except Exception as e:
        print(f"Client error: {e}")

if __name__ == "__main__":
    asyncio.run(simulate_client())
