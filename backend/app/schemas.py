from typing import Optional

from pydantic import BaseModel


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionResponse(BaseModel):
    detection_id: str
    vehicle_id: str
    hazard_type: str
    confidence: float
    bbox: BoundingBox
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: str
    source: str = "camera"


class IncidentStatusUpdate(BaseModel):
    status: str