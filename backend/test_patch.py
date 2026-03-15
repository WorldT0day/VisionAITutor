import json
import base64
from google.genai import types
import google.genai.live

# The Patch
class BytesEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, bytes):
            return base64.b64encode(obj).decode('utf-8')
        return super().default(obj)

original_dumps = json.dumps
def patched_dumps(obj, **kwargs):
    # Force our encoder
    kwargs['cls'] = BytesEncoder
    return original_dumps(obj, **kwargs)

# Apply patch to the module the SDK uses
google.genai.live.json.dumps = patched_dumps

# Test
print("Testing patched SDK behavior...")
try:
    # Blob will contain bytes internally
    blob = types.Blob(data=b"hello", mime_type="audio/pcm")
    # This is what _parse_client_message might produce
    msg = {"realtime_input": {"media_chunks": [{"data": blob.data, "mime_type": blob.mime_type}]}}
    
    # This call happens inside SDK
    result = google.genai.live.json.dumps(msg)
    print(f"Patched JSON: {result}")
    
    if "aGVsbG8=" in result:
        print("SUCCESS: Patch correctly encoded bytes to b64 string!")
    else:
        print("FAILURE: Patch did not encode bytes.")
except Exception as e:
    print(f"Patch Error: {e}")
