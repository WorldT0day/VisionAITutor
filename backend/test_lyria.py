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
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
    
    model_name = "lyria-realtime-exp"
    print(f"Testing Gemini Live Connection with model: {model_name} (v1alpha)")
    
    try:
        config = types.LiveConnectConfig(
            response_modalities=["AUDIO", "TEXT"],
            system_instruction=types.Content(
                parts=[types.Part(text="You are a helpful tutor.")]
            )
        )
        
        async with client.aio.live.connect(model=model_name, config=config) as session:
            print("Successfully connected!")
            await session.send(input="Hi there!")
            
            async for response in session.receive():
                if response.server_content:
                    print(f"RECVD: {response.server_content}")
                    return
                    
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
