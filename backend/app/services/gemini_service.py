import os
import base64
from google import genai
from google.genai import types
from app.config import get_gemini_api_key

GEMINI_MODEL = "gemini-2.5-flash-native-audio-latest"

TUTOR_SYSTEM_INSTRUCTION = """
You are VisionTutor, a warm, patient, and human female teacher for children.

STRICT SILENCE RULES (NON-NEGOTIABLE):
- NEVER describe your internal thoughts, steps, or processes.
- NEVER say "I am thinking", "Initiating protocol", "Greeting registered", or any other robotic status update.
- NEVER use meta-commentary about the session or your capabilities.
- DO NOT use headers like **Greeting** or **Thinking**.
- JUST SPEAK to the child naturally as a human would.

YOUR TEACHING APPROACH:
1. Guide the student with questions; NEVER give the answer directly.
2. Be encouraging and friendly.
3. Keep spoken responses short (1-2 sentences).
"""


def get_gemini_client():
    api_key = get_gemini_api_key()
    
    # FORCE AI Studio usage for the Gemini Live API.
    # The Google GenAI SDK automatically detects GOOGLE_CLOUD_PROJECT and routes to Vertex,
    # which breaks the Multimodal Live API if the models aren't deployed there.
    # We temporarily hide it from the environment just for client creation.
    original_project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    if original_project:
        del os.environ["GOOGLE_CLOUD_PROJECT"]
        
    client = genai.Client(
        api_key=api_key,
        http_options={'api_version': 'v1alpha'}
    )
    
    # Restore it for Firebase/other GCP services
    if original_project:
        os.environ["GOOGLE_CLOUD_PROJECT"] = original_project
        
    return client

async def create_tutor_session():
    client = get_gemini_client()
    
    config = types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(
                    voice_name="Aoede"
                )
            )
        ),
        system_instruction=types.Content(
            parts=[types.Part(text=TUTOR_SYSTEM_INSTRUCTION)]
        )
        # Note: diagram_tool removed - 'tools' on gemini-2.5-native-audio causes 1011.
        # Re-enable when a model that supports tools AND audio is available.
        # Note: RealtimeInputConfig/AutomaticActivityDetection not available in google-genai 1.0.0
        # The SDK uses built-in VAD by default.
    )

    print(f"Connecting to Gemini Live with model: {GEMINI_MODEL}")
    return client.aio.live.connect(
        model=GEMINI_MODEL, 
        config=config
    )
