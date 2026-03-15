import asyncio
import os
import base64
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Force AI Studio
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    del os.environ["GOOGLE_CLOUD_PROJECT"]

api_key = os.getenv("GEMINI_API_KEY")

async def test_dict_send():
    client = genai.Client(api_key=api_key)
    config = types.LiveConnectConfig(response_modalities=["AUDIO"])
    
    print("Testing dict send...")
    try:
        async with client.aio.live.connect(model="gemini-2.5-flash-native-audio-latest", config=config) as session:
            payload = {
                "realtime_input": {
                    "media_chunks": [{
                        "data": base64.b64encode(b"hello").decode('utf-8'),
                        "mime_type": "audio/pcm;rate=16000"
                    }]
                }
            }
            
            await session.send(input=payload)
            print("Dict send successful!")
    except Exception as e:
        print(f"Dict send failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_dict_send())
