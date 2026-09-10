from safe_route import calculate_safe_route


start_lat = 17.3850
start_lon = 78.4867

end_lat = 17.4000
end_lon = 78.5000


hazards = [
    {
        "hazard_type": "flood",
        "latitude": 17.390801,
        "longitude": 78.489109,
        "risk_level": "HIGH"
    }
]


result = calculate_safe_route(
    start_lat,
    start_lon,
    end_lat,
    end_lon,
    hazards
)


print("\nRESQDRIVE SAFE ROUTING")
print("============================")

print("Route type:", result["route_type"])

print("Distance:", result["distance_meters"], "meters")

print("Duration:", result["duration_seconds"], "seconds")


print("\nHazards:")

for hazard in result["hazards"]:
    print(hazard)


if result["route_type"] == "ALTERNATIVE":
    print("\n⚠️ HIGH-RISK HAZARD AVOIDED")