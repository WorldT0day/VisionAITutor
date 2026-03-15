from google.cloud import secretmanager
import os
from dotenv import load_dotenv

# Load local environment variables from .env if present
load_dotenv()

def get_secret(secret_id: str) -> str:
    env = os.getenv("ENV", "local")
    if env == "local":
        # Local dev: read from .env file
        val = os.getenv(secret_id)
        if not val:
            print(f"Warning: Secret {secret_id} not found in environment.")
        return val

    # Production: read from Secret Manager
    try:
        client = secretmanager.SecretManagerServiceClient()
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        if not project_id:
            raise ValueError("GOOGLE_CLOUD_PROJECT environment variable not set")
            
        name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        print(f"Error accessing secret {secret_id} from Secret Manager: {e}")
        return None

# Export commonly used secrets for easier access
def get_gemini_api_key():
    return get_secret("GEMINI_API_KEY")

def get_firebase_service_account_path():
    return get_secret("FIREBASE_SERVICE_ACCOUNT")
