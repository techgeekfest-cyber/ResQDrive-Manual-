import { useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const MOCK_LOCATION = {
  latitude: 17.385,
  longitude: 78.4867,
};

function DriverView({ onBackToAuthority }) {
  const [destinationLatitude, setDestinationLatitude] = useState("17.4000");
  const [destinationLongitude, setDestinationLongitude] =
    useState("78.5000");

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFindRoute(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setRoute(null);

    try {
      const response = await fetch(`${API_BASE_URL}/route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_latitude: MOCK_LOCATION.latitude,
          start_longitude: MOCK_LOCATION.longitude,
          end_latitude: Number(destinationLatitude),
          end_longitude: Number(destinationLongitude),
        }),
      });

      if (!response.ok) {
        throw new Error(`Route request failed: ${response.status}`);
      }

      const data = await response.json();

      setRoute(data.route);
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.message ||
          "Unable to calculate the route. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const routeCoordinates =
    route?.geometry?.coordinates?.map(([longitude, latitude]) => [
      latitude,
      longitude,
    ]) || [];

  const highRiskHazards =
    route?.hazards?.filter(
      (hazard) =>
        hazard.risk_level === "HIGH" ||
        hazard.risk_level === "CRITICAL"
    ) || [];

  const fastestRoute = route?.normal_route;
  const saferRoute = route?.safer_route;

  const fastestDistance = fastestRoute
    ? (fastestRoute.distance_meters / 1000).toFixed(2)
    : null;

  const fastestTime = fastestRoute
    ? Math.round(fastestRoute.duration_seconds / 60)
    : null;

  const saferDistance = saferRoute
    ? (saferRoute.distance_meters / 1000).toFixed(2)
    : null;

  const saferTime = saferRoute
    ? Math.round(saferRoute.duration_seconds / 60)
    : null;

  return (
    <div className="driver-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">ResQDrive</p>

          <h1>Driver Safety View</h1>

          <p className="header-subtitle">
            Find a safer route while staying aware of nearby hazards.
          </p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={onBackToAuthority}
        >
          Authority Dashboard
        </button>
      </header>

      <main className="driver-content">
        <section className="driver-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Route Planner</p>

              <h2>Where are you going?</h2>
            </div>
          </div>

          <form className="route-form" onSubmit={handleFindRoute}>
            <div className="form-field">
              <label htmlFor="destination-latitude">
                Destination latitude
              </label>

              <input
                id="destination-latitude"
                type="number"
                step="any"
                value={destinationLatitude}
                onChange={(event) =>
                  setDestinationLatitude(event.target.value)
                }
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="destination-longitude">
                Destination longitude
              </label>

              <input
                id="destination-longitude"
                type="number"
                step="any"
                value={destinationLongitude}
                onChange={(event) =>
                  setDestinationLongitude(event.target.value)
                }
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Finding route..." : "Find Safe Route"}
            </button>
          </form>

          <div className="mock-location-note">
            <strong>Current location:</strong> Demo location near
            17.3850, 78.4867
          </div>
        </section>

        {error && (
          <section className="driver-alert error-alert">
            <strong>Route unavailable</strong>

            <p>{error}</p>
          </section>
        )}

        {route && (
          <section className="driver-results">
            <div className="route-summary">
              <div>
                <p className="eyebrow">Recommendation</p>

                <h2>
                  {route.route_type === "ALTERNATIVE"
                    ? "Safer alternative recommended"
                    : "Normal route is suitable"}
                </h2>
              </div>

              <div className="route-metrics">
                {fastestRoute && (
                  <div>
                    <span>Fastest route</span>

                    <strong>{fastestDistance} km</strong>

                    <small>{fastestTime} min</small>
                  </div>
                )}

                {saferRoute && (
                  <div>
                    <span>Safer route</span>

                    <strong>{saferDistance} km</strong>

                    <small>{saferTime} min</small>
                  </div>
                )}

                {!saferRoute && (
                  <div>
                    <span>Recommended route</span>

                    <strong>
                      {(route.distance_meters / 1000).toFixed(2)} km
                    </strong>

                    <small>
                      {Math.round(route.duration_seconds / 60)} min
                    </small>
                  </div>
                )}
              </div>
            </div>

            {saferRoute && fastestRoute && (
              <div className="driver-alert">
                <strong>Route trade-off</strong>

                <p>
                  The safer route is{" "}
                  {Math.max(
                    0,
                    Number(saferDistance) - Number(fastestDistance)
                  ).toFixed(2)}{" "}
                  km longer and takes approximately{" "}
                  {Math.max(0, saferTime - fastestTime)} extra minutes
                  compared with the fastest route.
                </p>
              </div>
            )}

            {highRiskHazards.length > 0 ? (
              <div className="driver-alert warning-alert">
                <strong>High-risk hazard detected</strong>

                <p>
                  The route contains {highRiskHazards.length} HIGH or
                  CRITICAL hazard
                  {highRiskHazards.length === 1 ? "" : "s"}.
                  Consider the recommended alternative.
                </p>
              </div>
            ) : (
              <div className="driver-alert success-alert">
                <strong>No high-risk hazards detected</strong>

                <p>
                  No HIGH or CRITICAL hazards were detected on the
                  calculated route.
                </p>
              </div>
            )}

            <div className="driver-map">
              <MapContainer
                center={[
                  MOCK_LOCATION.latitude,
                  MOCK_LOCATION.longitude,
                ]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "500px", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={[
                    MOCK_LOCATION.latitude,
                    MOCK_LOCATION.longitude,
                  ]}
                >
                  <Popup>Your current demo location</Popup>
                </Marker>

                {routeCoordinates.length > 0 && (
                  <Polyline positions={routeCoordinates} />
                )}

                {highRiskHazards.map((hazard, index) => (
                  <Marker
                    key={`${hazard.latitude}-${hazard.longitude}-${index}`}
                    position={[
                      hazard.latitude,
                      hazard.longitude,
                    ]}
                  >
                    <Popup>
                      <strong>{hazard.risk_level} hazard</strong>

                      <br />

                      {hazard.hazard_type}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        )}

        {!route && !loading && !error && (
          <section className="driver-empty-state">
            <h2>Ready to plan your trip</h2>

            <p>
              Enter a destination above to check the route and identify
              high-risk hazards.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default DriverView;