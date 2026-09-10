import { useEffect, useMemo, useState } from "react";
import RiskMap from "./components/RiskMap";
import { fetchIncidents } from "./services/incidentApi";
import "./App.css";

function isDataStale(incidents) {
  if (!incidents.length) {
    return false;
  }

  const latestSeen = incidents.reduce((latest, incident) => {
    const timestamp = new Date(incident.last_seen).getTime();

    return timestamp > latest ? timestamp : latest;
  }, 0);

  if (!latestSeen) {
    return false;
  }

  const fifteenMinutes = 15 * 60 * 1000;

  return Date.now() - latestSeen > fifteenMinutes;
}

function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hazardFilter, setHazardFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [freshnessFilter, setFreshnessFilter] = useState("ALL");

  async function loadIncidents() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchIncidents();
      setIncidents(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load live incident data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncidents();

    const interval = setInterval(loadIncidents, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = useMemo(() => {
    const now = Date.now();

    return incidents.filter((incident) => {
      const hazardMatches =
        hazardFilter === "ALL" ||
        incident.hazard_type?.toLowerCase() === hazardFilter.toLowerCase();

      const riskMatches =
        riskFilter === "ALL" ||
        incident.risk_level?.toUpperCase() === riskFilter;

      let freshnessMatches = true;

      if (freshnessFilter !== "ALL") {
        const lastSeen = new Date(incident.last_seen).getTime();
        const minutes = Number(freshnessFilter);
        const cutoff = now - minutes * 60 * 1000;

        freshnessMatches = lastSeen >= cutoff;
      }

      return hazardMatches && riskMatches && freshnessMatches;
    });
  }, [incidents, hazardFilter, riskFilter, freshnessFilter]);

  const stale = isDataStale(incidents);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>ResQDrive</h1>
          <p>Live Disaster Risk Map</p>
        </div>

        <button onClick={loadIncidents}>
          Refresh
        </button>
      </header>

      <section className="filters">
        <div className="filter-group">
          <label htmlFor="hazard-filter">Hazard</label>

          <select
            id="hazard-filter"
            value={hazardFilter}
            onChange={(event) => setHazardFilter(event.target.value)}
          >
            <option value="ALL">All hazards</option>
            <option value="flood">Flood</option>
            <option value="pothole">Pothole</option>
            <option value="fallen_tree">Fallen tree</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="risk-filter">Risk level</label>

          <select
            id="risk-filter"
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
          >
            <option value="ALL">All levels</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="freshness-filter">Freshness</label>

          <select
            id="freshness-filter"
            value={freshnessFilter}
            onChange={(event) => setFreshnessFilter(event.target.value)}
          >
            <option value="ALL">All time</option>
            <option value="15">Last 15 minutes</option>
            <option value="60">Last 1 hour</option>
            <option value="360">Last 6 hours</option>
            <option value="1440">Last 24 hours</option>
          </select>
        </div>

        <div className={`data-status ${stale ? "stale" : "live"}`}>
          <span className="status-dot"></span>
          {stale ? "Data may be stale" : "Live data"}
        </div>

        <div className="incident-count">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </div>
      </section>

      {loading && (
        <div className="status">
          Loading incidents...
        </div>
      )}

      {error && (
        <div className="status error">
          {error}
        </div>
      )}

      {!loading && !error && filteredIncidents.length === 0 && (
        <div className="status">
          No incidents match the selected filters.
        </div>
      )}

      <main className="map-container">
        <RiskMap incidents={filteredIncidents} />
      </main>
    </div>
  );
}

export default App;