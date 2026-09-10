import uuid
from datetime import datetime, timezone

from fusion.risk_scoring import calculate_risk_score, get_risk_level
import math


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two GPS coordinates in meters.
    """

    R = 6371000

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return R * c

def group_nearby_detections(detections, distance_threshold=100):
    """
    Group detections that belong to the same geographic area.
    """

    groups = []

    for detection in detections:

        added_to_group = False

        for group in groups:

            reference = group[0]

            distance = calculate_distance(
                detection["latitude"],
                detection["longitude"],
                reference["latitude"],
                reference["longitude"]
            )

            if distance <= distance_threshold:
                group.append(detection)
                added_to_group = True
                break

        if not added_to_group:
            groups.append([detection])

    return groups

def calculate_vehicle_evidence(unique_vehicle_count):
    """
    Convert the number of vehicles reporting the same hazard
    into an evidence score between 0 and 1.
    """

    if unique_vehicle_count <= 0:
        return 0.0

    if unique_vehicle_count >= 5:
        return 1.0

    return unique_vehicle_count / 5


def calculate_location_agreement(detections):
    """
    Calculate how closely the detections agree on location.

    For the prototype, detections within approximately 100 meters
    are treated as strong location agreement.
    """

    if len(detections) <= 1:
        return 1.0

    latitudes = [
        detection["latitude"]
        for detection in detections
        if detection.get("latitude") is not None
    ]

    longitudes = [
        detection["longitude"]
        for detection in detections
        if detection.get("longitude") is not None
    ]

    if not latitudes or not longitudes:
        return 0.0

    latitude_range = max(latitudes) - min(latitudes)
    longitude_range = max(longitudes) - min(longitudes)

    # Approximately 100 meters in latitude/longitude
    if latitude_range <= 0.001 and longitude_range <= 0.001:
        return 1.0

    if latitude_range <= 0.003 and longitude_range <= 0.003:
        return 0.5

    return 0.0


def fuse_detections(detections):
    """
    Combine multiple detections of the same hazard
    into a single incident.
    """

    if not detections:
        return None

    hazard_type = detections[0]["hazard_type"]

    unique_vehicles = {
        detection["vehicle_id"]
        for detection in detections
        if detection.get("vehicle_id")
    }

    unique_vehicle_count = len(unique_vehicles)
    evidence_count = len(detections)

    ai_confidence = sum(
        detection["confidence"]
        for detection in detections
    ) / evidence_count

    vehicle_evidence = calculate_vehicle_evidence(
        unique_vehicle_count
    )

    location_agreement = calculate_location_agreement(
        detections
    )

    # Prototype assumption:
    # detections received recently receive maximum freshness.
    freshness = 1.0

    risk_score = calculate_risk_score(
        ai_confidence,
        vehicle_evidence,
        location_agreement,
        freshness
    )

    risk_level = get_risk_level(risk_score)

    latitude = sum(
        detection["latitude"]
        for detection in detections
        if detection.get("latitude") is not None
    ) / len([
        detection
        for detection in detections
        if detection.get("latitude") is not None
    ])

    longitude = sum(
        detection["longitude"]
        for detection in detections
        if detection.get("longitude") is not None
    ) / len([
        detection
        for detection in detections
        if detection.get("longitude") is not None
    ])

    return {
        "incident_id": str(uuid.uuid4()),
        "hazard_type": hazard_type,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "confidence_summary": round(ai_confidence, 4),
        "unique_vehicle_count": unique_vehicle_count,
        "evidence_count": evidence_count,
        "latitude": latitude,
        "longitude": longitude,
        "first_seen": datetime.now(timezone.utc).isoformat(),
        "last_seen": datetime.now(timezone.utc).isoformat(),
        "status": "NEW"
    }