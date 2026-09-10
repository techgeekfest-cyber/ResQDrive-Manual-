import { useMemo } from "react";

const ACTIVE_STATUSES = ["NEW", "ACKNOWLEDGED", "DISPATCHED"];

export default function DashboardSummary({ incidents, detections }) {
  const summary = useMemo(() => {
    const activeIncidents = incidents.filter((incident) =>
      ACTIVE_STATUSES.includes(incident.status)
    );

    const highCount = activeIncidents.filter(
      (incident) => incident.risk_level === "HIGH"
    ).length;

    const criticalCount = activeIncidents.filter(
      (incident) => incident.risk_level === "CRITICAL"
    ).length;

    const hazardCounts = activeIncidents.reduce((counts, incident) => {
      counts[incident.hazard_type] =
        (counts[incident.hazard_type] || 0) + 1;
      return counts;
    }, {});

    const vehicles = new Set(
      detections
        .map((detection) => detection.vehicle_id)
        .filter(Boolean)
    );

    return {
      activeCount: activeIncidents.length,
      highCount,
      criticalCount,
      hazardCounts,
      vehicleCount: vehicles.size,
      recentReports: detections.length,
    };
  }, [incidents, detections]);

  return (
    <section className="dashboard-summary">
      <div className="kpi-card">
        <span>Total Active</span>
        <strong>{summary.activeCount}</strong>
      </div>

      <div className="kpi-card">
        <span>HIGH Risk</span>
        <strong>{summary.highCount}</strong>
      </div>

      <div className="kpi-card">
        <span>CRITICAL Risk</span>
        <strong>{summary.criticalCount}</strong>
      </div>

      <div className="kpi-card">
        <span>Recent Reports</span>
        <strong>{summary.recentReports}</strong>
      </div>

      <div className="kpi-card">
        <span>Vehicles Reporting</span>
        <strong>{summary.vehicleCount}</strong>
      </div>

      <div className="hazard-card">
        <h3>Hazard Distribution</h3>

        {Object.keys(summary.hazardCounts).length === 0 ? (
          <p>No active hazards</p>
        ) : (
          Object.entries(summary.hazardCounts).map(
            ([hazard, count]) => (
              <div className="hazard-row" key={hazard}>
                <span>{hazard}</span>
                <strong>{count}</strong>
              </div>
            )
          )
        )}
      </div>
    </section>
  );
}
