import uuid

from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from geoalchemy2 import Geography

from db.database import Base


class Detection(Base):
    __tablename__ = "detections"

    detection_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    vehicle_id = Column(String(100))
    hazard_type = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    bbox = Column(JSONB)

    latitude = Column(Float)
    longitude = Column(Float)

    location = Column(
        Geography(geometry_type="POINT", srid=4326)
    )

    timestamp = Column(DateTime(timezone=True), nullable=False)

    source = Column(
        String(50),
        default="camera"
    )

class IncidentStatus(Base):
    __tablename__ = "incident_status"

    incident_id = Column(String(100), primary_key=True)
    status = Column(String(30), nullable=False, default="NEW")
    updated_at = Column(DateTime(timezone=True), nullable=False)