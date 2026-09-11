import { useEffect, useMemo, useState } from "react";
import RiskMap from "./components/RiskMap";
import DashboardSummary from "./components/DashboardSummary";
import DriverView from "./components/DriverView";
import {
  fetchIncidents,
  fetchDetections,
  updateIncidentStatus,
} from "./services/incidentApi";
import "./App.css";

const ACTIVE_STATUSES = ["NEW", "ACKNOWLEDGED", "DISPATCHED"];

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

function isIncidentStale(incident) {
  if (!incident?.last_seen) {
    return false;
  }

  const lastSeen = new Date(incident.last_seen).getTime();

  if (!Number.isFinite(lastSeen)) {
    return false;
  }

  return Date.now() - lastSeen > 15 * 60 * 1000;
}

function App() {
  const [viewMode, setViewMode] = useState("authority");

  const [incidents, setIncidents] = useState([]);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hazardFilter, setHazardFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [freshnessFilter, setFreshnessFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [updatingIncidentId, setUpdatingIncidentId] = useState(null);

  const [sortField, setSortField] = useState("risk_score");
  const [sortDirection, setSortDirection] = useState("desc");

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [incidentData, detectionData] = await Promise.all([
        fetchIncidents(),
        fetchDetections(),
      ]);

      setIncidents(incidentData);
      setDetections(detectionData);
    } catch (err) {
      console.error(err);
      setError("Unable to load live dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(loadDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = useMemo(() => {
    const now = Date.now();

    const filtered = incidents.filter((incident) => {
      const hazardMatches =
        hazardFilter === "ALL" ||
        incident.hazard_type?.toLowerCase() ===
          hazardFilter.toLowerCase();

      const riskMatches =
        riskFilter === "ALL" ||
        incident.risk_level?.toUpperCase() === riskFilter;

      const statusMatches =
        statusFilter === "ALL" ||
        incident.status?.toUpperCase() === statusFilter;

      let freshnessMatches = true;

      if (freshnessFilter !== "ALL") {
        const lastSeen = new Date(incident.last_seen).getTime();
        const minutes = Number(freshnessFilter);
        const cutoff = now - minutes * 60 * 1000;

        freshnessMatches = lastSeen >= cutoff;
      }

      return (
        hazardMatches &&
        riskMatches &&
        statusMatches &&
        freshnessMatches
      );
    });

    return [...filtered].sort((a, b) => {
      let valueA;
      let valueB;

      if (sortField === "hazard_type") {
        valueA = a.hazard_type || "";
        valueB = b.hazard_type || "";
      } else if (sortField === "risk_level") {
        const riskOrder = {
          LOW: 1,
          MEDIUM: 2,
          HIGH: 3,
          CRITICAL: 4,
        };

        valueA = riskOrder[a.risk_level] || 0;
        valueB = riskOrder[b.risk_level] || 0;
      } else if (sortField === "confidence_summary") {
        valueA = Number(a.confidence_summary || 0);
        valueB = Number(b.confidence_summary || 0);
      } else if (sortField === "evidence_count") {
        valueA = Number(a.evidence_count || 0);
        valueB = Number(b.evidence_count || 0);
      } else if (sortField === "unique_vehicle_count") {
        valueA = Number(a.unique_vehicle_count || 0);
        valueB = Number(b.unique_vehicle_count || 0);
      } else if (sortField === "status") {
        valueA = a.status || "";
        valueB = b.status || "";
      } else {
        valueA = Number(a.risk_score || 0);
        valueB = Number(b.risk_score || 0);
      }

      if (typeof valueA === "string") {
        const comparison = valueA.localeCompare(valueB);

        return sortDirection === "asc"
          ? comparison
          : -comparison;
      }

      const comparison = valueA - valueB;

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });
  }, [
    incidents,
    hazardFilter,
    riskFilter,
    statusFilter,
    freshnessFilter,
    sortField,
    sortDirection,
  ]);

  const stale = isDataStale(incidents);

  const activeIncidents = incidents.filter((incident) =>
    ACTIVE_STATUSES.includes(incident.status)
  );

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  function sortIndicator(field) {
    if (sortField !== field) {
      return "";
    }

    return sortDirection === "asc" ? "↑" : "↓";
  }

  async function handleStatusChange(incidentId, newStatus) {
    try {
      setUpdatingIncidentId(incidentId);

      await updateIncidentStatus(incidentId, newStatus);

      await loadDashboardData();
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Unable to update incident status."
      );
    } finally {
      setUpdatingIncidentId(null);
    }
  }

  const selectedIncident = incidents.find(
    (incident) => incident.incident_id === selectedIncidentId
  );

  if (viewMode === "driver") {
    return (
      <DriverView
        onBackToAuthority={() => setViewMode("authority")}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>ResQDrive</h1>
          <p>Authority Operations Dashboard</p>
        </div>

        <div className="header-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => setViewMode("driver")}
          >
            Driver View
          </button>

          <button
            type="button"
            onClick={loadDashboardData}
          >
            Refresh
          </button>
        </div>
      </header>

      <DashboardSummary
        incidents={incidents}
        detections={detections}
      />

      <section className="filters">
        <div className="filter-group">
          <label htmlFor="hazard-filter">Hazard</label>

          <select
            id="hazard-filter"
            value={hazardFilter}
            onChange={(event) =>
              setHazardFilter(event.target.value)
            }
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
            onChange={(event) =>
              setRiskFilter(event.target.value)
            }
          >
            <option value="ALL">All levels</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All statuses</option>
            <option value="NEW">NEW</option>
            <option value="ACKNOWLEDGED">
              ACKNOWLEDGED
            </option>
            <option value="DISPATCHED">
              DISPATCHED
            </option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="DISMISSED">DISMISSED</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="freshness-filter">
            Freshness
          </label>

          <select
            id="freshness-filter"
            value={freshnessFilter}
            onChange={(event) =>
              setFreshnessFilter(event.target.value)
            }
          >
            <option value="ALL">All time</option>
            <option value="15">Last 15 minutes</option>
            <option value="60">Last 1 hour</option>
            <option value="360">Last 6 hours</option>
            <option value="1440">
              Last 24 hours
            </option>
          </select>
        </div>

        <div
          className={
            stale
              ? "data-status stale"
              : "data-status live"
          }
        >
          <span className="status-dot"></span>
          {stale ? "Data may be stale" : "Live data"}
        </div>

        <div className="incident-count">
          Showing {filteredIncidents.length} of{" "}
          {incidents.length} incidents
        </div>
      </section>

      {loading && (
        <div className="status">
          Loading dashboard data...
        </div>
      )}

      {error && (
        <div className="status error">
          {error}
        </div>
      )}

      <section className="incident-section">
        <div className="section-header">
          <div>
            <h2>Incident Operations</h2>

            <p>
              {activeIncidents.length} active incident
              {activeIncidents.length === 1
                ? ""
                : "s"}
            </p>
          </div>
        </div>

        {!loading &&
          !error &&
          filteredIncidents.length === 0 && (
            <div className="status">
              No incidents match the selected filters.
            </div>
          )}

        {filteredIncidents.length > 0 && (
          <div className="incident-table-wrapper">
            <table className="incident-table">
              <thead>
                <tr>
                  <th>
                    <button
                      className="sort-button"
                      type="button"
                      onClick={() =>
                        handleSort("hazard_type")
                      }
                    >
                      Hazard {sortIndicator("hazard_type")}
                    </button>
                  </th>

                  <th>
                    <button
                      className="sort-button"
                      type="button"
                      onClick={() =>
                        handleSort("risk_level")
                      }
                    >
                      Risk {sortIndicator("risk_level")}
                    </button>
                  </th>

                  <th>
                    <button
                      className="sort-button"
                      type="button"
                      onClick={() =>
                        handleSort("confidence_summary")
                      }
                    >
                      Confidence{" "}
                      {sortIndicator("confidence_summary")}
                    </button>
                  </th>

                  <th>
                    <button
                      className="sort-button"
                      type="button"
                      onClick={() =>
                        handleSort("evidence_count")
                      }
                    >
                      Evidence{" "}
                      {sortIndicator("evidence_count")}
                    </button>
                  </th>

                  <th>
                    <button
                      className="sort-button"
                      type="button"
                      onClick={() =>
                        handleSort(
                          "unique_vehicle_count"
                        )
                      }
                    >
                      Vehicles{" "}
                      {sortIndicator(
                        "unique_vehicle_count"
                      )}
                    </button>
                  </th>

                  <th>
                    <button
                      className="sort-button"
                      type="button"
                      onClick={() =>
                        handleSort("status")
                      }
                    >
                      Status {sortIndicator("status")}
                    </button>
                  </th>

                  <th>Location</th>
                </tr>
              </thead>

              <tbody>
                {filteredIncidents.map((incident) => {
                  const incidentStale =
                    isIncidentStale(incident);

                  return (
                    <tr
                      key={incident.incident_id}
                      className={[
                        selectedIncidentId ===
                        incident.incident_id
                          ? "selected-incident"
                          : "",
                        incidentStale
                          ? "stale-incident"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        setSelectedIncidentId(
                          incident.incident_id
                        )
                      }
                    >
                      <td>
                        <strong>
                          {incident.hazard_type?.replace(
                            "_",
                            " "
                          )}
                        </strong>

                        {incidentStale && (
                          <span className="stale-label">
                            STALE
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            "risk-badge " +
                            (incident.risk_level?.toLowerCase() ||
                              "")
                          }
                        >
                          {incident.risk_level}
                        </span>
                      </td>

                      <td>
                        {Math.round(
                          Number(
                            incident.confidence_summary ||
                              0
                          ) * 100
                        )}
                        %
                      </td>

                      <td>
                        {incident.evidence_count}
                      </td>

                      <td>
                        {incident.unique_vehicle_count}
                      </td>

                      <td
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <select
                          value={incident.status}
                          disabled={
                            updatingIncidentId ===
                            incident.incident_id
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              incident.incident_id,
                              event.target.value
                            )
                          }
                        >
                          <option value="NEW">
                            NEW
                          </option>

                          <option value="ACKNOWLEDGED">
                            ACKNOWLEDGED
                          </option>

                          <option value="DISPATCHED">
                            DISPATCHED
                          </option>

                          <option value="RESOLVED">
                            RESOLVED
                          </option>

                          <option value="DISMISSED">
                            DISMISSED
                          </option>
                        </select>
                      </td>

                      <td>
                        {Number(
                          incident.latitude
                        ).toFixed(4)}
                        ,{" "}
                        {Number(
                          incident.longitude
                        ).toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedIncident && (
          <div className="selected-incident-panel">
            <div>
              <h3>Incident Evidence Summary</h3>

              <p>
                {selectedIncident.hazard_type?.replace(
                  "_",
                  " "
                )}{" "}
                · {selectedIncident.risk_level}
              </p>
            </div>

            <div className="evidence-grid">
              <div>
                <span>Risk score</span>

                <strong>
                  {Number(
                    selectedIncident.risk_score || 0
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Confidence</span>

                <strong>
                  {Math.round(
                    Number(
                      selectedIncident.confidence_summary ||
                        0
                    ) * 100
                  )}
                  %
                </strong>
              </div>

              <div>
                <span>Evidence count</span>

                <strong>
                  {selectedIncident.evidence_count ?? 0}
                </strong>
              </div>

              <div>
                <span>Vehicles</span>

                <strong>
                  {selectedIncident.unique_vehicle_count ??
                    0}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {selectedIncident.status || "N/A"}
                </strong>
              </div>

              <div>
                <span>Location</span>

                <strong>
                  {Number(
                    selectedIncident.latitude
                  ).toFixed(4)}
                  ,{" "}
                  {Number(
                    selectedIncident.longitude
                  ).toFixed(4)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </section>

      <main className="map-container">
        <RiskMap
          incidents={filteredIncidents}
          selectedIncidentId={selectedIncidentId}
        />
      </main>
    </div>
  );
}

export default App;
