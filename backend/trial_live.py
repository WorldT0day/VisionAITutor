import asyncio
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Force AI Studio
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    del os.environ["GOOGLE_CLOUD_PROJECT"]

api_key = os.getenv("GEMINI_API_KEY")

async def test_model(model_name, version):
    print(f"\n--- Testing {model_name} on {version} ---")
    client = genai.Client(api_key=api_key, http_options={'api_version': version})
    config = {
        "response_modalities": ["AUDIO", "TEXT"],
        "speech_config": {
            "voice_config": {
                "prebuilt_voice_config": {
                    "voice_name": "Kore"
                }
            }
        }
    }
    try:
        async with client.aio.live.connect(model=model_name, config=config) as session:
            print(f"SUCCESS: Connected to {model_name} on {version}")
            return True
    except Exception as e:
        print(f"FAILED: {model_name} on {version} - {e}")
        return False

async def main():
    models_to_test = [
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash",
        "gemini-live-2.0-flash-exp",
        "gemini-live-2.5-flash-preview",
        "gemini-2.5-flash-native-audio-latest"
    ]
    versions = ["default", "v1", "v1alpha", "v1beta"]
    
    for v in versions:
        for m in models_to_test:
            if v == "default":
                print(f"\n--- Testing {m} on DEFAULT ---")
                client = genai.Client(api_key=api_key)
            else:
                print(f"\n--- Testing {m} on {v} ---")
                client = genai.Client(api_key=api_key, http_options={'api_version': v})
            config = {
                "response_modalities": ["AUDIO"],
                "speech_config": {
                    "voice_config": {
                        "prebuilt_voice_config": {
                            "voice_name": "Kore"
                        }
                    }
                }
            }
            try:
                async with client.aio.live.connect(model=m, config=config) as session:
                    print(f"SUCCESS: Connected to {m} on {v}")
                    res = True
            except Exception as e:
                print(f"FAILED: {m} on {v} - {e}")
                res = False

            if res:
                print(f"\n>>>> FOUND WORKING COMBO: {m} on {v} <<<<")
                # return # Keep searching just in case

if __name__ == "__main__":
    asyncio.run(main())
