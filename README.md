# 🚨 ResQDrive — Cooperative Vehicle-Based Disaster Intelligence Network

> **Sense. Verify. Reroute. Respond.**

ResQDrive is an AI-powered, vehicle-based disaster intelligence system that turns everyday vehicles into **mobile road-sensing nodes**.

During disasters, road conditions can change within minutes. Flooded roads, potholes, fallen trees, and other obstructions may not be captured quickly enough by fixed infrastructure or manual reporting.

ResQDrive addresses this by using **vehicle camera observations + AI hazard detection + GPS metadata + multi-vehicle evidence fusion** to build continuously updated road-risk intelligence.

The system ultimately helps identify hazardous road segments, visualize them on a live map, and support safer route selection.

---

## 🌐 System Overview

```text
Vehicle Camera
      ↓
YOLO Hazard Detection
      ↓
Hazard + Confidence
      ↓
GPS + Timestamp + Vehicle ID
      ↓
FastAPI Backend
      ↓
PostgreSQL + PostGIS
      ↓
Multi-Vehicle Evidence Fusion
      ↓
Road Risk Score
      ↓
Live Risk Map
      ↓
Risk-Aware Routing
