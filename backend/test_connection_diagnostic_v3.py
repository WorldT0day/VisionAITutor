import asyncio
import os
import sys
from google import genai
from google.genai import types

# Add the project root to sys.path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import get_gemini_api_key

async def test_connection():
    api_key = get_gemini_api_key()
    client = genai.Client(api_key=api_key) # Default to v1
    
    model_name = "gemini-1.5-flash-latest"
    print(f"Testing Gemini Live Connection with model: {model_name} (v1)")
    
    try:
        config = types.LiveConnectConfig(
            response_modalities=["AUDIO", "TEXT"],
            system_instruction=types.Content(
                parts=[types.Part(text="You are a helpful tutor. Respond with text and audio.")]
            )
        )
        
        async with client.aio.live.connect(model=model_name, config=config) as session:
            print("Successfully connected!")
            print("Sending initial greeting...")
            await session.send(input="Hi there! Can you hear me?")
            
            print("Waiting for response...")
            async for response in session.receive():
                if response.server_content:
                    print(f"Received server content: {response.server_content}")
                    if response.server_content.model_turn:
                         for part in response.server_content.model_turn.parts:
                             if part.text:
                                 print(f"TEXT RECEIVED: {part.text}")
                             if part.inline_data:
                                 print(f"AUDIO RECEIVED: {len(part.inline_data.data)} bytes")
                    # If we got text, we are successful
                    if response.server_content.model_turn and any(p.text for p in response.server_content.model_turn.parts):
                        print("SUCCESS: Received text transcript!")
                        return
                if response.tool_call:
                    print(f"TOOL CALL: {response.tool_call}")
                    
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
