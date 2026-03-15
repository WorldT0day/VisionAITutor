import os
from google import genai
from google.genai import types
from google.cloud import storage
from app.config import get_gemini_api_key
import uuid

def upload_to_cloud_storage(image_bytes: bytes, folder_prefix: str = "diagrams/") -> str:
    """Uploads the generated image byte stream to Google Cloud Storage and returns a public URL.
       If missing GCP credentials, writes locally and returns a local relative path or mock URL for hackathon."""
       
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    # For now, if we don't have GCS properly setup, just return a cute placeholder SVG
    # A real implementation would push to a GCS bucket
    if not project_id or project_id == "your-project-id":
        return f"https://placehold.co/600x400/png?text=Generated+Diagram"
    
    try:
        bucket_name = f"{project_id}-assets"
        client = storage.Client(project=project_id)
        bucket = client.bucket(bucket_name)
        
        filename = f"{folder_prefix}{uuid.uuid4()}.png"
        blob = bucket.blob(filename)
        
        blob.upload_from_string(image_bytes, content_type="image/png")
        blob.make_public()
        return blob.public_url
    except Exception as e:
        print(f"Error uploading diagram to storage: {e}")
        return "https://placehold.co/600x400/png?text=Storage+Error"


async def generate_diagram(problem_description: str, subject: str = "general") -> str:
    """Generate an explanatory diagram using Gemini image generation."""
    
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    api_key = get_gemini_api_key()

    if project_id and project_id != "your-project-id":
        client = genai.Client(vertexai=True, project=project_id, location="us-central1")
    else:
        # Fall back to api key
        client = genai.Client(api_key=api_key)

    prompt = f"""
    Create a clean, simple, educational diagram for a child studying this topic:
    Problem: {problem_description}
    Subject: {subject}

    Requirements:
    - Use bright, clear colors
    - Label everything clearly with large text
    - Keep it simple and easy to understand
    - Include measurements/values if relevant
    - White background
    - No unnecessary decoration
    """

    try:
        # Expected to use vertex image generation, but for standard genai SDK it maps to Imagen
        response = client.models.generate_images(
            model='imagen-3.0-generate-001',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                output_mime_type="image/png"
            )
        )
        
        if response.generated_images:
            image_bytes = response.generated_images[0].image.image_bytes
            return upload_to_cloud_storage(image_bytes)
        
    except Exception as e:
        print(f"Diagram generation failed: {e}")
        
    return "https://placehold.co/600x400/png?text=Generation+Failed"
