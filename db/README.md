# Phase 4 – PostgreSQL + PostGIS

## Overview

Phase 4 integrates PostgreSQL and PostGIS into the ResQDrive backend.

The database stores AI-generated hazard detections along with vehicle information, GPS coordinates, timestamps, confidence scores, and bounding boxes.

## Technologies

- PostgreSQL 16
- PostGIS 3.4
- Docker
- Docker Compose
- SQLAlchemy
- GeoAlchemy2
- psycopg2

## Database

Database name:

`resqdrive`

User:

`resqdrive_user`

The PostgreSQL + PostGIS database runs using Docker Compose.

## Detection Table

The `detections` table stores:

- detection_id
- vehicle_id
- hazard_type
- confidence
- bbox
- latitude
- longitude
- location
- timestamp
- source

The `location` column uses:

`GEOGRAPHY(POINT, 4326)`

This allows ResQDrive to store geographic coordinates as spatial data.

## Spatial Index

A GiST spatial index is created on the location column:

```sql
CREATE INDEX idx_detections_location
ON detections
USING GIST(location);