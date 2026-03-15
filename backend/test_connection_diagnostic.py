import asyncio
import os
import sys

# Add the project root to sys.path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(
        api_key=api_key,
        # Default to v1 or remove version
    )
    return client

async def test_connection():
    # Overwrite the one from app.services for this test
    # ...
    print("Testing Gemini Live Connection...")
    try:
        session_context = await create_tutor_session()
        async with session_context as session:
            print("Successfully connected to Gemini Live!")
            
            # Try a simple text send to see if it responds
            from google.genai import types
            print("Sending initial greeting with TEXT request...")
            # We don't send modalities here, they are in the config from create_tutor_session
            # So I'll just check what the current config produces.
            await session.send(input="Hi there! Please respond with text and audio.")
            
            print("Waiting for response (expecting text or audio)...")
            async for response in session.receive():
                if response.server_content:
                    print(f"Received server content: {response.server_content}")
                    if response.server_content.model_turn:
                         for part in response.server_content.model_turn.parts:
                             if part.text:
                                 print(f"TEXT RECEIVED: {part.text}")
                             if part.inline_data:
                                 print(f"AUDIO RECEIVED: {len(part.inline_data.data)} bytes")
                if response.tool_call:
                    print(f"TOOL CALL: {response.tool_call}")
        print("Test completed successfully.")
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
