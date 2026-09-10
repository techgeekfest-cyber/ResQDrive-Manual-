from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from pathlib import Path
from datetime import datetime, timezone
import shutil
import uuid
# Temporary storage for detected incidents.
# This will later be replaced by PostgreSQL/PostGIS.
detections_store = []
from backend.app.services.inference_service import detect_hazards


app = FastAPI(
    title="ResQDrive API",
    description="Backend API for the ResQDrive disaster intelligence system",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ResQDrive API"
    }


@app.post("/detect")
async def detect(
    file: UploadFile = File(...),
    vehicle_id: str = Form("vehicle-001"),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None)
):
    """
    Upload an image and detect ResQDrive hazards.

    The request can also contain vehicle and GPS information.
    """

    # Create temporary upload directory
    upload_dir = Path("backend/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate a unique filename
    file_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = upload_dir / file_name

    # Save uploaded image
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Run Phase 2 YOLO inference
        detections = detect_hazards(str(file_path))

        # Current UTC timestamp
        timestamp = datetime.now(timezone.utc).isoformat()

        # Convert Phase 2 detections into ResQDrive detection records
        formatted_detections = []

        for detection in detections:
            x1, y1, x2, y2 = detection["bounding_box"]

            formatted_detections.append({
                "detection_id": str(uuid.uuid4()),
                "vehicle_id": vehicle_id,
                "hazard_type": detection["hazard"],
                "confidence": detection["confidence"],
                "bbox": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2
                },
                "latitude": latitude,
                "longitude": longitude,
                "timestamp": timestamp,
                "source": "camera"
            })

        detections_store.extend(formatted_detections)
        return {
            "status": "success",
            "filename": file.filename,
            "detection_count": len(formatted_detections),
            "detections": formatted_detections
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    finally:
        # Delete temporary image
        if file_path.exists():
            file_path.unlink()


@app.get("/detections")
def get_detections():
    """
    Return all detections received since the server started.
    """
    return {
        "count": len(detections_store),
        "detections": detections_store
    }