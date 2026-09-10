from sqlalchemy import text

from db.database import engine
from fusion.evidence_fusion import (
    fuse_detections,
    group_nearby_detections
)


def get_recent_detections(limit=50):
    """
    Retrieve recent hazard detections from PostgreSQL.
    """

    query = text("""
        SELECT
            detection_id,
            vehicle_id,
            hazard_type,
            confidence,
            latitude,
            longitude,
            timestamp
        FROM detections
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT :limit
    """)

    with engine.connect() as connection:
        result = connection.execute(
            query,
            {"limit": limit}
        )

        detections = []

        for row in result:
            detections.append({
                "detection_id": str(row.detection_id),
                "vehicle_id": row.vehicle_id,
                "hazard_type": row.hazard_type,
                "confidence": row.confidence,
                "latitude": row.latitude,
                "longitude": row.longitude,
                "timestamp": row.timestamp
            })

    return detections


def group_by_hazard(detections):
    """
    Group detections by hazard type.
    """

    grouped = {}

    for detection in detections:
        hazard_type = detection["hazard_type"]

        if hazard_type not in grouped:
            grouped[hazard_type] = []

        grouped[hazard_type].append(detection)

    return grouped


def generate_incidents():
    """
    Generate geographically grouped incidents
    from database detections.
    """

    detections = get_recent_detections()

    grouped_detections = group_by_hazard(detections)

    incidents = []

    for hazard_type, hazard_detections in grouped_detections.items():

        nearby_groups = group_nearby_detections(
            hazard_detections,
            distance_threshold=100
        )

        for group in nearby_groups:

            if not group:
                continue

            incident = fuse_detections(group)

            if incident:
                incidents.append(incident)

    return incidents