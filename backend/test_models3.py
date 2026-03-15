import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Temporarily remove GCP project from environment to force AI Studio
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    del os.environ["GOOGLE_CLOUD_PROJECT"]
if "GOOGLE_APPLICATION_CREDENTIALS" in os.environ:
    del os.environ["GOOGLE_APPLICATION_CREDENTIALS"]

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")

client = genai.Client(api_key=api_key)

print("Listing models from AI Studio...")
try:
    models = client.models.list()
    print("All Models found:")
    for m in models:
        print(f" - {m.name}")
        
except Exception as e:
    print(f"Error listing models: {e}")
