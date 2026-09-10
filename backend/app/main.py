from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel
from datetime import datetime, timezone
import shutil
import uuid

from sqlalchemy import text

from backend.app.services.inference_service import detect_hazards
from routing.safe_route import calculate_safe_route
from db.database import engine


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="ResQDrive API",
    description="Backend API for the ResQDrive disaster intelligence system",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Route request model
# --------------------------------------------------

class RouteRequest(BaseModel):
    start_latitude: float
    start_longitude: float
    end_latitude: float
    end_longitude: float


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ResQDrive API"
    }


# --------------------------------------------------
# Hazard Detection
# --------------------------------------------------

@app.post("/detect")
async def detect(
    file: UploadFile = File(...),
    vehicle_id: str = Form("vehicle-001"),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None)
):
    """
    Upload an image and detect ResQDrive hazards.

    Detection results are stored in PostgreSQL/PostGIS.
    """

    # Create temporary upload directory
    upload_dir = Path("backend/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = upload_dir / file_name

    # Save uploaded image
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:

        # --------------------------------------------------
        # Run Phase 2 YOLO inference
        # --------------------------------------------------

        detections = detect_hazards(str(file_path))

        timestamp = datetime.now(timezone.utc)

        formatted_detections = []

        # --------------------------------------------------
        # Store every detection in PostgreSQL
        # --------------------------------------------------

        with engine.begin() as connection:

            for detection in detections:

                x1, y1, x2, y2 = detection["bounding_box"]

                detection_id = uuid.uuid4()

                # Bounding box stored as JSON
                bbox = {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2
                }

                # Insert detection into PostgreSQL
                connection.execute(
                    text("""
                        INSERT INTO detections (
                            detection_id,
                            vehicle_id,
                            hazard_type,
                            confidence,
                            bbox,
                            latitude,
                            longitude,
                            location,
                            timestamp,
                            source
                        )
                        VALUES (
                            :detection_id,
                            :vehicle_id,
                            :hazard_type,
                            :confidence,
                            CAST(:bbox AS JSONB),
                            :latitude,
                            :longitude,

                            CASE
                                WHEN :latitude IS NOT NULL
                                 AND :longitude IS NOT NULL
                                THEN ST_SetSRID(
                                    ST_MakePoint(
                                        :longitude,
                                        :latitude
                                    ),
                                    4326
                                )::geography
                                ELSE NULL
                            END,

                            :timestamp,
                            :source
                        )
                    """),
                    {
                        "detection_id": detection_id,
                        "vehicle_id": vehicle_id,
                        "hazard_type": detection["hazard"],
                        "confidence": detection["confidence"],
                        "bbox": str(bbox).replace("'", '"'),
                        "latitude": latitude,
                        "longitude": longitude,
                        "timestamp": timestamp,
                        "source": "camera"
                    }
                )

                # Response object
                formatted_detections.append({
                    "detection_id": str(detection_id),
                    "vehicle_id": vehicle_id,
                    "hazard_type": detection["hazard"],
                    "confidence": detection["confidence"],
                    "bbox": bbox,
                    "latitude": latitude,
                    "longitude": longitude,
                    "timestamp": timestamp.isoformat(),
                    "source": "camera"
                })

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


# --------------------------------------------------
# Get all detections
# --------------------------------------------------

@app.get("/detections")
def get_detections():
    """
    Return detections stored in PostgreSQL.
    """

    try:

        with engine.connect() as connection:

            result = connection.execute(
                text("""
                    SELECT
                        detection_id,
                        vehicle_id,
                        hazard_type,
                        confidence,
                        bbox,
                        latitude,
                        longitude,
                        timestamp,
                        source
                    FROM detections
                    ORDER BY timestamp DESC
                """)
            )

            detections = []

            for row in result:

                detections.append({
                    "detection_id": str(row.detection_id),
                    "vehicle_id": row.vehicle_id,
                    "hazard_type": row.hazard_type,
                    "confidence": row.confidence,
                    "bbox": row.bbox,
                    "latitude": row.latitude,
                    "longitude": row.longitude,
                    "timestamp": row.timestamp.isoformat(),
                    "source": row.source
                })

        return {
            "count": len(detections),
            "detections": detections
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# --------------------------------------------------
# Safe Routing
# --------------------------------------------------

@app.post("/route")
def calculate_route(request: RouteRequest):
    """
    Calculate a safe route between two locations.

    Currently uses temporary hazard data.
    Later this will be replaced by Phase 5
    risk/fusion output.
    """

    hazards = [
        {
            "hazard_type": "flood",
            "latitude": 17.390801,
            "longitude": 78.489109,
            "risk_level": "HIGH"
        }
    ]

    try:

        result = calculate_safe_route(
            request.start_latitude,
            request.start_longitude,
            request.end_latitude,
            request.end_longitude,
            hazards
        )

        return {
            "status": "success",
            "route": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )