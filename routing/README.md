# ResQDrive Phase 7 – Safe Routing

Phase 7 implements hazard-aware routing using the OSRM routing engine.

## Features

- Calculate normal driving routes between two GPS coordinates
- Check routes for nearby hazards
- Identify HIGH and CRITICAL risk hazards
- Generate an alternative route when a dangerous hazard is detected
- Return route distance, duration and GeoJSON geometry
- Integrated with the FastAPI backend through `POST /route`

## Routing Flow

```text
Start Location
      ↓
OSRM Normal Route
      ↓
Check Route Against Hazards
      ↓
Hazard Found?
   ↙          ↘
 No            Yes
 ↓              ↓
Normal Route   Alternative Route