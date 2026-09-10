import uuid
from datetime import datetime, timezone

from sqlalchemy import text
from db.database import engine


detection_id = uuid.uuid4()

sql = text("""
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
        ST_SetSRID(
            ST_MakePoint(:longitude, :latitude),
            4326
        )::geography,
        :timestamp,
        :source
    )
""")

try:
    with engine.begin() as connection:
        connection.execute(
            sql,
            {
                "detection_id": detection_id,
                "vehicle_id": "vehicle-001",
                "hazard_type": "pothole",
                "confidence": 0.87,
                "bbox": '[120.0, 80.0, 410.0, 290.0]',
                "latitude": 17.3850,
                "longitude": 78.4867,
                "timestamp": datetime.now(timezone.utc),
                "source": "camera",
            },
        )

    print("✅ Detection inserted successfully!")
    print("Detection ID:", detection_id)

except Exception as e:
    print("❌ Insert failed!")
    print(e)