#!/bin/bash
set -e

PROJECT_ID="your-project-id"
REGION="us-central1"
SERVICE_NAME="vision-tutor"

echo "Building frontend..."
cd ../frontend && npm install && npm run build && cd ../deploy

echo "Copying frontend build to backend static..."
mkdir -p ../backend/static
cp -r ../frontend/dist/* ../backend/static/

echo "Building and pushing Docker image..."
gcloud builds submit \
  --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/vision-tutor-repo/${SERVICE_NAME}:latest \
  ../backend

echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/vision-tutor-repo/${SERVICE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=${PROJECT_ID},ENV=production \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 3600

echo "Deployment complete!"
