import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Force AI Studio
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    del os.environ["GOOGLE_CLOUD_PROJECT"]

api_key = os.getenv("GEMINI_API_KEY")

def scan(version):
    print(f"\n=== Scanning {version} ===")
    client = genai.Client(api_key=api_key, http_options={'api_version': version})
    try:
        models = client.models.list()
        found = False
        for m in models:
            methods = getattr(m, 'supported_generation_methods', [])
            if "bidiGenerateContent" in methods:
                print(f" [LIVE!] {m.name}")
                found = True
        if not found:
            print(" No bidi models found.")
    except Exception as e:
        print(f" Error: {e}")

if __name__ == "__main__":
    scan("v1alpha")
    scan("v1beta")
    scan("v1")
