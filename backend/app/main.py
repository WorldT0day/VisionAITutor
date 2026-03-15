from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from app.routers import websocket

import firebase_admin
from firebase_admin import credentials
from app.config import get_firebase_service_account_path

app = FastAPI(title="VisionTutor API")

# Initialize Firebase Admin
cred_path = get_firebase_service_account_path()
if cred_path and os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    try:
        firebase_admin.initialize_app()
    except Exception as e:
        print(f"Warning: Firebase Admin init failed: {e}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "VisionTutor API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
