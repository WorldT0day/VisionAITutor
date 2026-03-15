# VisionTutor — AI-Powered Real-Time Homework Tutor

VisionTutor is a multimodal real-time AI Tutor web application where a child points their phone or laptop camera at homework, and an AI agent reads the question, explains it verbally using a conversational tone, generates educational diagrams on-the-fly, gives step-by-step hints, and automatically tracks the student's progress over time.

## Features
1. **User Authentication (Firebase Auth)**: Secure email and password signup flows saving profile data directly to Cloud Firestore.
2. **Real-Time Camera Feed (WebRTC)**: Automatically captures frames from the user's camera to enable the AI's Vision capabilities.
3. **Gemini Live API Integration (Core Tutor Agent)**: A persistent, bi-directional WebSocket connection leveraging Google's GenAI SDK and Gemini 2.0 Flash to see, hear, and speak to the student with Socratic teaching strategies.
4. **Diagram Generation**: The AI can dynamically trigger educational diagrams using Vertex Imagen 3 to aid visual learners.
5. **Step-by-Step Hints System**: Intelligent prompting that progressively reveals hints without giving the answers away immediately.
6. **Progress Tracking**: Real-time dashboards visualizing learning time, streaks, and subject mastery.

## Tech Stack
| Layer | Technology |
| --- | --- |
| Frontend | React (Vite) + Tailwind CSS |
| Camera/Mic | WebRTC (`getUserMedia`) + Web Audio API |
| Audio Streaming | WebSocket connection to FastAPI |
| Backend | Python 3.9+ with FastAPI |
| AI Model | Gemini 2.0 Flash via Gemini Live API (GenAI SDK) |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Cloud Storage | Google Cloud Storage |
| Deployment | Google Cloud Run + Artifact Registry + Cloud Build |

## Setup Instructions

### Prerequisites
- Node.js (v20+)
- Python (3.9+)
- A Google Cloud Platform (GCP) account w/ Billing Enabled.
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/vision-tutor.git
cd vision-tutor
```

### 2. Google Cloud Platform Setup
1. Create a GCP Project.
2. Enable the following APIs:
```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  generativelanguage.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com
```

### 3. Troubleshooting Gemini Live Connection
If the tutor does not respond, check the following:
1. **API Version**: Ensure you are using `v1alpha` for the Gemini Live API in `gemini_service.py`.
2. **Model Name**: Use `gemini-2.0-flash` or `gemini-2.0-flash-exp` depending on your account region.
3. **Audio Format**: The API expects **PCM 16kHz Mono**. The frontend `useWebSocket.js` handles this conversion automatically.

### 3. Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/) and attach it to your GCP project.
2. Enable **Authentication** (Email/Password).
3. Enable **Firestore Database** (Test Mode or specific rules).
4. Generate an **Admin SDK Service Account key** and download it locally.
5. Generate the **Web SDK Config**.

### 4. Configure Secrets
We use local `.env` files for development and Google Secret Manager for production.

**Backend `.env`** (`backend/.env`):
```env
ENV=local
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_SERVICE_ACCOUNT=/absolute/path/to/service-account.json
```

**Frontend `.env`** (`frontend/.env`):
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=localhost:8080
```

### 5. Install Dependencies
**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 6. Run Locally
Start Backend:
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

Start Frontend:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 7. Deployment
To deploy to Google Cloud Run:
```bash
cd deploy
chmod +x deploy.sh
./deploy.sh
```

## Google Cloud Services Used
- **Google Cloud Run**: Serverless container execution handling the FastAPI WebSockets and Gemini proxying.
- **Google Cloud Storage**: Persisting generated diagrams.
- **Google Cloud Firestore**: NoSQL document DB storing user profiles and learning progress.
- **Secret Manager**: Securely holding the Gemini API Key and Firebase admin credentials in production.
- **Artifact Registry**: Docker container storage.

## Project Structure
```text
vision-tutor/
├── frontend/             # React Vite SPA
│   ├── src/components/   # Auth, Tutor views, Dashboard
│   ├── src/hooks/        # useWebRTC, useWebSocket
│   └── src/services/     # Firebase SDK init
├── backend/              # FastAPI Server
│   ├── app/routers/      # WebSocket endpoints
│   ├── app/services/     # Gemini GenAI SDK, Diagram Generation
│   └── app/utils/        # Auth middleware parsing Firebase Tokens
├── deploy/               # `deploy.sh` and `cloudbuild.yaml`
└── README.md
```

## License
MIT
