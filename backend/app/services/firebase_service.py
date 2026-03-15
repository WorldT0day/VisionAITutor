from google.cloud import firestore
from datetime import datetime
import os

def get_firestore_client():
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    if not project_id or project_id == "your-project-id":
        print("Warning: Missing GOOGLE_CLOUD_PROJECT for Firestore")
        return None
    try:
        return firestore.Client(project=project_id)
    except Exception as e:
        print(f"Error initializing Firestore: {e}")
        return None

async def save_session_history(uid: str, session_id: str, transcript: list, diagrams: list):
    """Saves completed session data to firestore"""
    db = get_firestore_client()
    if not db:
        return
        
    doc_ref = db.collection("sessions").document(session_id)
    try:
        doc_ref.set({
            "userId": uid,
            "endedAt": firestore.SERVER_TIMESTAMP,
            "transcript": transcript,
            "diagrams": diagrams,
            "duration": 5 # Placeholder length
        }, merge=True)
    except Exception as e:
        print(f"Error writing to Firestore: {e}")
