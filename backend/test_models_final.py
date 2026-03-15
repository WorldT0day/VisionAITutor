import asyncio
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Force AI Studio
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    del os.environ["GOOGLE_CLOUD_PROJECT"]

api_key = os.getenv("GEMINI_API_KEY")

async def test_model(m, v):
    print(f"--- Testing {m} on {v} ---")
    client = genai.Client(api_key=api_key, http_options={'api_version': v} if v else None)
    config = {"response_modalities": ["AUDIO"]}
    try:
        async with client.aio.live.connect(model=m, config=config) as session:
            print(f"SUCCESS: {m} on {v}")
            return True
    except Exception as e:
        # print(f"FAILED: {m} on {v} - {e}")
        return False

async def main():
    models = ["gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-2.5-flash-native-audio-latest"]
    versions = ["v1alpha", "v1beta", None]
    for v in versions:
        for m in models:
            await test_model(m, v)

if __name__ == "__main__":
    asyncio.run(main())
