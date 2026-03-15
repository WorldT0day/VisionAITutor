import os
import sys
from google import genai

# Add the project root to sys.path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import get_gemini_api_key

def list_models():
    api_key = get_gemini_api_key()
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
    
    print("Listing All Models (v1alpha):")
    try:
        models = client.models.list()
        for model in models:
            # Print basic info to see available attributes
            print(f"Name: {model.name}, Supported: {getattr(model, 'supported_generation_methods', 'N/A')}")
            # If bidi is in supported methods, we found our candidate
            methods = getattr(model, 'supported_generation_methods', [])
            if "bidiGenerateContent" in methods:
                 print(f"  >>> FOUND LIVE MODEL: {model.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
