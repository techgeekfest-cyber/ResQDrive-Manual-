import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const riskColors = {
  LOW: "#16a34a",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#dc2626",
};

function createRiskIcon(riskLevel) {
  const color = riskColors[riskLevel] || "#6b7280";

  return L.divIcon({
    className: "risk-marker",
    html: `
      <div
        style="
          width: 22px;
          height: 22px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        "
        aria-label="${riskLevel || "Unknown"} risk"
      ></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
}

function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
}

function MapSync({ incidents, selectedIncidentId }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedIncidentId) {
      return;
    }

    const selectedIncident = incidents.find(
      (incident) => incident.incident_id === selectedIncidentId
    );

    if (!selectedIncident) {
      return;
    }

    const latitude = Number(selectedIncident.latitude);
    const longitude = Number(selectedIncident.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    map.flyTo([latitude, longitude], 16, {
      duration: 1,
    });
  }, [map, incidents, selectedIncidentId]);

  return null;
}

function RiskMap({ incidents, selectedIncidentId }) {
  const defaultCenter = [17.385, 78.4867];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      scrollWheelZoom={true}
      className="risk-map"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapSync
        incidents={incidents}
        selectedIncidentId={selectedIncidentId}
      />

      {incidents.map((incident) => (
        <Marker
          key={incident.incident_id}
          position={[incident.latitude, incident.longitude]}
          icon={createRiskIcon(incident.risk_level)}
        >
          <Popup>
            <div className="incident-popup">
              <h3>{incident.hazard_type || "Unknown hazard"}</h3>

              <p>
                <strong>Risk level:</strong>{" "}
                {incident.risk_level || "N/A"}
              </p>

              <p>
                <strong>Risk score:</strong>{" "}
                {incident.risk_score ?? "N/A"}
              </p>

              <p>
                <strong>Confidence:</strong>{" "}
                {incident.confidence_summary ?? "N/A"}
              </p>

              <p>
                <strong>Evidence:</strong>{" "}
                {incident.evidence_count ?? 0}
              </p>

              <p>
                <strong>Vehicles:</strong>{" "}
                {incident.unique_vehicle_count ?? 0}
              </p>

              <p>
                <strong>First seen:</strong>{" "}
                {formatDateTime(incident.first_seen)}
              </p>

              <p>
                <strong>Last seen:</strong>{" "}
                {formatDateTime(incident.last_seen)}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {incident.status || "N/A"}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default RiskMap;
