import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")

client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})

print("Listing models...")
try:
    models = client.models.list()
    live_models = []
    for m in models:
        # Check if bidi is in supported generation methods
        if "bidiGenerateContent" in getattr(m, 'supported_generation_methods', []):
            live_models.append(m.name)
        elif getattr(m, 'name', '').startswith('models/gemini-2.0'):
            live_models.append(m.name + " (no bidi flag)")
            
    print("Models found for Gemini 2.0 / Live:")
    for m in live_models:
        print(f" - {m}")
        
except Exception as e:
    print(f"Error listing models: {e}")
