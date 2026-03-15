import asyncio
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Force AI Studio
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    del os.environ["GOOGLE_CLOUD_PROJECT"]

api_key = os.getenv("GEMINI_API_KEY")

async def test_session():
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
    
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO", "TEXT"],
    )
    
    print("Connecting to gemini-2.0-flash-exp on v1alpha...")
    try:
        async with client.aio.live.connect(model="gemini-2.0-flash-exp", config=config) as session:
            print("SUCCESS: Connection established!")
            print("Sending 'Hello'...")
            await session.send(input="Hello", end_of_turn=True)
            
            async for response in session.receive():
                print(f"Received: {response}")
                if response.text or response.data:
                    print("RECEIVED CONTENT!")
                    break
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_session())
