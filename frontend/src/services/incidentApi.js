const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchIncidents() {
  const response = await fetch(`${API_BASE_URL}/incidents`);

  if (!response.ok) {
    throw new Error(`Failed to fetch incidents: ${response.status}`);
  }

  const data = await response.json();

  return data.incidents || [];
}

export async function fetchDetections() {
  const response = await fetch(`${API_BASE_URL}/detections`);

  if (!response.ok) {
    throw new Error(`Failed to fetch detections: ${response.status}`);
  }

  const data = await response.json();

  return data.detections || [];
}

export async function updateIncidentStatus(incidentId, status) {
  const response = await fetch(
    `${API_BASE_URL}/incidents/${incidentId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail || `Failed to update incident: ${response.status}`
    );
  }

  return response.json();
}
