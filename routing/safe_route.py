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
    """
    Calculate a route and check it for nearby hazards.

    If a HIGH or CRITICAL risk hazard is found,
    generate an alternative route.
    """

    # Get normal route
    normal_route = get_route(
        start_latitude,
        start_longitude,
        end_latitude,
        end_longitude
    )

    # Check whether hazards are close to the route
    detected_hazards = check_route_hazards(
        normal_route["geometry"],
        hazards,
        threshold=100
    )

    # Find HIGH or CRITICAL hazards
    high_risk_hazards = [
        hazard
        for hazard in detected_hazards
        if hazard["risk_level"] in ["HIGH", "CRITICAL"]
    ]

    # No dangerous hazard found
    if not high_risk_hazards:
        return {
            "route_type": "NORMAL",
            "hazards": detected_hazards,
            "distance_meters": normal_route["distance_meters"],
            "duration_seconds": normal_route["duration_seconds"],
            "geometry": normal_route["geometry"]
        }

    # Take the first high-risk hazard
    hazard = high_risk_hazards[0]

    # Generate alternative route
    alternative_route = get_alternative_route(
        start_latitude,
        start_longitude,
        end_latitude,
        end_longitude,
        hazard["latitude"],
        hazard["longitude"]
    )

    return {
        "route_type": "ALTERNATIVE",
        "hazards": detected_hazards,
        "avoided_hazard": hazard,
        "distance_meters": alternative_route["distance_meters"],
        "duration_seconds": alternative_route["duration_seconds"],
        "geometry": alternative_route["geometry"]
    }