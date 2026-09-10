from fusion.database_fusion import generate_incidents


incidents = generate_incidents()

print("\n===== RESQDRIVE DATABASE FUSION =====")

if not incidents:
    print("No incidents found.")

else:
    for incident in incidents:

        print("\nIncident")
        print("----------------------------")
        print("Incident ID:", incident["incident_id"])
        print("Hazard:", incident["hazard_type"])
        print("Risk Score:", incident["risk_score"])
        print("Risk Level:", incident["risk_level"])
        print("Confidence:", incident["confidence_summary"])
        print("Vehicles:", incident["unique_vehicle_count"])
        print("Evidence:", incident["evidence_count"])
        print("Location:", incident["latitude"], incident["longitude"])
        print("Status:", incident["status"])

print("\n====================================")