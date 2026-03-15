import asyncio
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

project_id = os.getenv("GOOGLE_CLOUD_PROJECT")

async def test_vertex():
    print(f"Testing Vertex AI on project: {project_id}")
    # Live API is most stable in us-central1 for Vertex
    client = genai.Client(vertexai=True, project=project_id, location="us-central1")
    
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO", "TEXT"],
    )
    
    print("Connecting to gemini-2.0-flash-exp on Vertex (us-central1)...")
    try:
        async with client.aio.live.connect(model="gemini-2.0-flash-exp", config=config) as session:
            print("SUCCESS: Connected via Vertex!")
            return True
    except Exception as e:
        print(f"FAILED Vertex: {e}")
        return False

if __name__ == "__main__":
    if project_id:
        asyncio.run(test_vertex())
    else:
        print("No project ID found.")
