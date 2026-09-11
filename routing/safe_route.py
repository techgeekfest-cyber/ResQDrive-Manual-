try:
    from routing.osrm_router import get_route, get_alternative_route
    from routing.hazard_avoidance import check_route_hazards
except ModuleNotFoundError:
    from osrm_router import get_route, get_alternative_route
    from hazard_avoidance import check_route_hazards


def calculate_safe_route(
    start_latitude,
    start_longitude,
    end_latitude,
    end_longitude,
    hazards
):
    normal_route = get_route(
        start_latitude,
        start_longitude,
        end_latitude,
        end_longitude
    )

    detected_hazards = check_route_hazards(
        normal_route["geometry"],
        hazards,
        threshold=100
    )

    high_risk_hazards = [
        hazard
        for hazard in detected_hazards
        if hazard["risk_level"] in ["HIGH", "CRITICAL"]
    ]

    normal_route_data = {
        "distance_meters": normal_route["distance_meters"],
        "duration_seconds": normal_route["duration_seconds"],
        "geometry": normal_route["geometry"]
    }

    if not high_risk_hazards:
        return {
            "route_type": "NORMAL",
            "normal_route": normal_route_data,
            "safer_route": None,
            "hazards": detected_hazards,
            "avoided_hazard": None,
            "distance_meters": normal_route["distance_meters"],
            "duration_seconds": normal_route["duration_seconds"],
            "geometry": normal_route["geometry"]
        }

    hazard = high_risk_hazards[0]

    alternative_route = get_alternative_route(
        start_latitude,
        start_longitude,
        end_latitude,
        end_longitude,
        hazard["latitude"],
        hazard["longitude"]
    )

    safer_route_data = {
        "distance_meters": alternative_route["distance_meters"],
        "duration_seconds": alternative_route["duration_seconds"],
        "geometry": alternative_route["geometry"]
    }

    return {
        "route_type": "ALTERNATIVE",
        "normal_route": normal_route_data,
        "safer_route": safer_route_data,
        "hazards": detected_hazards,
        "avoided_hazard": hazard,
        "distance_meters": alternative_route["distance_meters"],
        "duration_seconds": alternative_route["duration_seconds"],
        "geometry": alternative_route["geometry"]
    }