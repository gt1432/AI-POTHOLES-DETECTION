"""
FastAPI Inference Server for RoadGuard AI Pothole Detection.
Can be run directly or imports the main app application.
"""
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import main application with full API endpoints and frontend serving
try:
    from app import app
except ImportError:
    import io, os
    from fastapi import FastAPI, File, UploadFile, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse, StreamingResponse
    from PIL import Image

    app = FastAPI(
        title="RoadGuard AI - Pothole Detection API",
        description="Inference API for YOLO Pothole Detection model deployed on Render.",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    MODEL_PATH = os.getenv("MODEL_PATH", "yolo11n.pt")
    model = None
    try:
        from ultralytics import YOLO
        model = YOLO(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model {MODEL_PATH}: {e}")

    @app.get("/")
    def health_check():
        return {
            "status": "online",
            "service": "RoadGuard AI Pothole Detector",
            "model_loaded": model is not None
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)