"""Canonical prediction schema for ResQDrive hazard detection models.

Phase 1 trains three independent single-class YOLO models (flood, pothole,
fallen_tree). This module defines the shared output shape a future Phase 2
inference service will normalize every model's raw detections into, so all
three models stay interchangeable behind one interface:

    {
        "hazard": "flood",
        "confidence": 0.92,
        "bounding_box": [x1, y1, x2, y2]
    }

No inference API is implemented here yet -- this only fixes the contract.
"""

CANONICAL_HAZARDS = ("flood", "pothole", "fallen_tree")


def normalize_prediction(hazard: str, confidence: float, bounding_box) -> dict:
    """Build one canonical prediction dict.

    hazard: must be one of CANONICAL_HAZARDS. Since each Phase 1 model is a
        single-class specialist (class index 0 == its own hazard name), the
        caller passes the hazard the *model* represents, not a class name
        looked up from the model's own (single-entry) names list.
    confidence: YOLO box confidence score, 0-1.
    bounding_box: (x1, y1, x2, y2) in pixel coordinates of the original image.
    """
    if hazard not in CANONICAL_HAZARDS:
        raise ValueError(f"Unknown hazard {hazard!r}, expected one of {CANONICAL_HAZARDS}")
    x1, y1, x2, y2 = bounding_box
    return {
        "hazard": hazard,
        "confidence": float(confidence),
        "bounding_box": [float(x1), float(y1), float(x2), float(y2)],
    }
