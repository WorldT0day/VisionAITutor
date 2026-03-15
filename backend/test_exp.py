import asyncio
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Force AI Studio
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    del os.environ["GOOGLE_CLOUD_PROJECT"]

api_key = os.getenv("GEMINI_API_KEY")

async def test_exp():
    print("--- Testing gemini-2.0-flash-exp ---")
    # No forced version
    client = genai.Client(api_key=api_key)
    config = {
        "response_modalities": ["AUDIO"],
    }
    try:
        async with client.aio.live.connect(model="gemini-2.0-flash-exp", config=config) as session:
            print("SUCCESS: Connected to gemini-2.0-flash-exp")
            return True
    except Exception as e:
        print(f"FAILED: gemini-2.0-flash-exp - {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_exp())
