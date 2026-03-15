import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")

client = genai.Client(api_key=api_key)

print("Listing models...")
try:
    models = client.models.list()
    live_models = []
    for m in models:
        # Check if bidi is in supported generation methods
        if "bidiGenerateContent" in getattr(m, 'supported_generation_methods', []):
            live_models.append(m.name)
        elif 'bidi' in str(getattr(m, 'supported_generation_methods', [])):
            live_models.append(m.name + " (has bidi substring)")
        elif getattr(m, 'name', '').startswith('models/gemini-2.0') or getattr(m, 'name', '').startswith('models/gemini-live'):
            live_models.append(m.name + f" (methods: {getattr(m, 'supported_generation_methods', [])})")
            
    print("Models found for Gemini 2.0 / Live:")
    for m in live_models:
        print(f" - {m}")
        
except Exception as e:
    print(f"Error listing models: {e}")
