import asyncio
import os
import base64
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Force AI Studio
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    del os.environ["GOOGLE_CLOUD_PROJECT"]

api_key = os.getenv("GEMINI_API_KEY")

async def test_base64_send():
    client = genai.Client(api_key=api_key)
    
    # Fake 1 second of silent 16bit mono 16k pcm
    audio_bytes = b'\x00' * 32000
    
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
    )
    
    print("Connecting to gemini-2.5-flash-native-audio-latest...")
    try:
        async with client.aio.live.connect(model="gemini-2.5-flash-native-audio-latest", config=config) as session:
            print("Connected. Sending raw bytes...")
            try:
                await session.send(
                    input=types.LiveClientRealtimeInput(
                        media_chunks=[types.Blob(
                            mime_type="audio/pcm;rate=16000",
                            data=audio_bytes
                        )]
                    )
                )
                print("Raw bytes sent (Unexpected!)")
            except TypeError as e:
                print(f"Caught Expected TypeError: {e}")
                
            print("\nSending Base64 encoded data...")
            b64_data = base64.b64encode(audio_bytes).decode('utf-8')
            await session.send(
                input=types.LiveClientRealtimeInput(
                    media_chunks=[types.Blob(
                        mime_type="audio/pcm;rate=16000",
                        data=b64_data
                    )]
                )
            )
            print("Base64 data sent successfully!")
            
    except Exception as e:
        print(f"General Failure: {e}")

if __name__ == "__main__":
    asyncio.run(test_base64_send())
