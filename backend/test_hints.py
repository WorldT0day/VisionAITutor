import asyncio
import os
from google import genai
from google.genai import types
from app.config import get_gemini_api_key

async def test():
    api_key = get_gemini_api_key()
    if 'GOOGLE_CLOUD_PROJECT' in os.environ:
        del os.environ['GOOGLE_CLOUD_PROJECT']
        
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
    
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"], # Keeping it AUDIO as per the app
        system_instruction=types.Content(
            parts=[types.Part(text="You are a tutor. Always respond with BOTH spoken audio AND a text representation of a hint wrapped in [HINT]Your hint here[/HINT].")]
        )
    )
    
    try:
        async with client.aio.live.connect(model="gemini-2.5-flash-native-audio-latest", config=config) as session:
            print("Connected. Sending message...")
            await session.send(input="What is 2+2?", end_of_turn=True)
            
            while True:
                response = await session.receive()
                if response.server_content and response.server_content.model_turn:
                    for part in response.server_content.model_turn.parts:
                        if part.text:
                            print(f"GOT TEXT: {part.text}")
                        if part.inline_data:
                            print(f"GOT AUDIO CHUNK")
                if response.server_content and response.server_content.turn_complete:
                    break
            print("Test complete.")
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
