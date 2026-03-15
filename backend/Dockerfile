FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code
COPY . .

# Assume frontend build is copied into backend/static during build script
# if using single container, but in reality we might serve from a CDN
# For this mock, FastAPI can mount the static directory
# e.g., in main.py: app.mount("/", StaticFiles(directory="static", html=True), name="static")

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
