import asyncio
import os
import sys
from google import genai
from google.genai import types

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.config import get_gemini_api_key

async def test_models():
    api_key = get_gemini_api_key()
    
    # Try removing GCP project for AI Studio
    if "GOOGLE_CLOUD_PROJECT" in os.environ:
        del os.environ["GOOGLE_CLOUD_PROJECT"]
        
    client = genai.Client(api_key=api_key)
    
    models_to_test = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-2.5-flash-native-audio-latest"
    ]
    
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        system_instruction=types.Content(parts=[types.Part(text="Hi")])
    )
    
    for m in models_to_test:
        print(f"\nTesting {m}...")
        try:
            async with client.aio.live.connect(model=m, config=config) as session:
                print(f"SUCCESS! {m} supports Live API in v1alpha")
        except Exception as e:
            err_msg = str(e)
            if "1008" in err_msg:
                print(f"FAILED (policy/not found): 1008")
            else:
                print(f"FAILED: {err_msg[:100]}...")

if __name__ == "__main__":
    asyncio.run(test_models())
