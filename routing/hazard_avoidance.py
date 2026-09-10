import math


# Temporary mock hazards
# These will later come from Phase 5.
HAZARDS = [
    {
        "hazard_type": "flood",
        "latitude": 17.3920,
        "longitude": 78.4930,
        "risk_level": "HIGH"
    },
    {
        "hazard_type": "pothole",
        "latitude": 17.3970,
        "longitude": 78.4970,
        "risk_level": "MEDIUM"
    }
]


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate approximate distance between two GPS points in meters.
    """

    R = 6371000  # Earth radius in meters

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

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def check_route_hazards(route_geometry, hazards, threshold=100):
    """
    Check whether hazards are close to the calculated route.

    threshold:
        Maximum distance in meters for a hazard
        to be considered close to the route.
    """

    coordinates = route_geometry["coordinates"]

    detected_hazards = []

    for hazard in hazards:

        hazard_lat = hazard["latitude"]
        hazard_lon = hazard["longitude"]

        for point in coordinates:

            route_lon = point[0]
            route_lat = point[1]

            distance = calculate_distance(
                hazard_lat,
                hazard_lon,
                route_lat,
                route_lon
            )

            if distance <= threshold:

                detected_hazards.append({
                    "hazard_type": hazard["hazard_type"],
                    "risk_level": hazard["risk_level"],
                    "distance_from_route_meters": round(distance, 2),
                    "latitude": hazard_lat,
                    "longitude": hazard_lon
                })

                break

    return detected_hazards