import requests


OSRM_URL = "https://router.project-osrm.org/route/v1/driving"


def get_route(
    start_latitude: float,
    start_longitude: float,
    end_latitude: float,
    end_longitude: float
):
    """
    Get a driving route between two GPS coordinates using OSRM.
    """

    coordinates = (
        f"{start_longitude},{start_latitude};"
        f"{end_longitude},{end_latitude}"
    )

    url = f"{OSRM_URL}/{coordinates}"

    params = {
        "overview": "full",
        "geometries": "geojson"
    }

    response = requests.get(url, params=params, timeout=30)

    response.raise_for_status()

    data = response.json()

    if data["code"] != "Ok":
        raise RuntimeError("OSRM could not find a route.")

    route = data["routes"][0]

    return {
        "distance_meters": route["distance"],
        "duration_seconds": route["duration"],
        "geometry": route["geometry"]
    }
def get_alternative_route(
    start_latitude: float,
    start_longitude: float,
    end_latitude: float,
    end_longitude: float,
    hazard_latitude: float,
    hazard_longitude: float
):
    """
    Get an alternative route by routing through a temporary
    waypoint away from the hazardous location.
    """

    # Move the waypoint slightly away from the hazard.
    waypoint_latitude = hazard_latitude + 0.003
    waypoint_longitude = hazard_longitude + 0.003

    coordinates = (
        f"{start_longitude},{start_latitude};"
        f"{waypoint_longitude},{waypoint_latitude};"
        f"{end_longitude},{end_latitude}"
    )

    url = f"{OSRM_URL}/{coordinates}"

    params = {
        "overview": "full",
        "geometries": "geojson"
    }

    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()

    data = response.json()

    if data["code"] != "Ok":
        raise RuntimeError("OSRM could not find an alternative route.")

    route = data["routes"][0]

    return {
        "distance_meters": route["distance"],
        "duration_seconds": route["duration"],
        "geometry": route["geometry"]
    }