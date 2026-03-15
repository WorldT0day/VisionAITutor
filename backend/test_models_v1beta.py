import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Force AI Studio
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    del os.environ["GOOGLE_CLOUD_PROJECT"]

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})

print("Listing models with v1beta...")
try:
    models = client.models.list()
    for m in models:
        methods = getattr(m, 'supported_generation_methods', [])
        if "bidiGenerateContent" in methods or "streamGenerateContent" in methods:
            print(f" - {m.name} (Methods: {methods})")
        elif "gemini-2.0" in m.name:
             print(f" - {m.name} (Methods: {methods})")
except Exception as e:
    print(f"Error: {e}")
