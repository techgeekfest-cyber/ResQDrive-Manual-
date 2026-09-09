"""Phase 2 inference foundation for ResQDrive.

Loads the three Phase 1 single-class YOLO specialist models (flood, pothole,
fallen_tree) and runs all of them independently on one input image,
normalizing every detection through `schema.normalize_prediction()` into one
combined list.

This module intentionally does NOT include GPS/timestamp tagging, database
persistence, a web API, or evidence fusion across detections -- those are
Phase 3+ concerns. See `ai/inference/README.md`.
"""

from pathlib import Path
from typing import Any, Union

import numpy as np
from ultralytics import YOLO

# Same dual-mode import strategy as config.py: package-relative first,
# falling back to a flat import when run directly from ai/inference/.
try:
    from .config import get_model_path
    from .schema import CANONICAL_HAZARDS, normalize_prediction
except ImportError:
    from config import get_model_path
    from schema import CANONICAL_HAZARDS, normalize_prediction

# An image can be given as a path on disk or as an already-loaded array
# (e.g. a frame read with OpenCV, shape HxWxC).
ImageInput = Union[str, Path, np.ndarray]


class ResQDriveInference:
    """Runs all three hazard specialist models on one image.

    Each hazard has its own single-class YOLO model (class index 0 always
    means "this hazard"). This class loads all three at construction time
    and, on each `infer()` call, runs every model independently on the same
    image and merges their detections into one canonical list.
    """

    def __init__(self) -> None:
        """Load the flood, pothole, and fallen_tree specialist models.

        Raises:
            FileNotFoundError: If a hazard's `best.pt` weights file is
                missing at its configured path.
            Exception: Any error raised by Ultralytics while loading a
                model is propagated, not swallowed.
        """
        self.models: dict[str, YOLO] = {}
        for hazard in CANONICAL_HAZARDS:
            model_path = get_model_path(hazard)
            if not model_path.is_file():
                raise FileNotFoundError(
                    f"Missing model weights for hazard {hazard!r} at {model_path}. "
                    "Train it via ai/notebooks/ (see docs/PHASE1.md) or set "
                    "RESQDRIVE_MODEL_DIR to point at a directory that has it."
                )
            self.models[hazard] = YOLO(str(model_path))

        _validate_models_loaded(self.models)

    def infer(self, image: ImageInput, conf: float = 0.25) -> list[dict[str, Any]]:
        """Run all three specialist models on one image and merge detections.

        Args:
            image: Either a filesystem path to an image, or an in-memory
                image as a numpy array (e.g. from `cv2.imread`).
            conf: Minimum confidence threshold passed to each YOLO model.

        Returns:
            A list of canonical detection dicts (see `schema.py`), combining
            results from all three models. Each dict has the shape:
                {"hazard": str, "confidence": float, "bounding_box": [x1, y1, x2, y2]}

        Raises:
            Exception: Any error raised by Ultralytics during inference on a
                given model is propagated, not swallowed.
        """
        if isinstance(image, (str, Path)):
            image_input: Union[str, np.ndarray] = str(image)
        elif isinstance(image, np.ndarray):
            image_input = image
        else:
            raise TypeError(
                f"image must be a file path (str/Path) or a numpy array, got {type(image)!r}"
            )

        detections: list[dict[str, Any]] = []
        for hazard, model in self.models.items():
            results = model.predict(source=image_input, conf=conf, verbose=False)
            for result in results:
                boxes = result.boxes
                if boxes is None:
                    continue
                for box in boxes:
                    confidence = float(box.conf[0])
                    bounding_box = [float(v) for v in box.xyxy[0]]
                    detections.append(normalize_prediction(hazard, confidence, bounding_box))

        _validate_detections(detections)
        return detections


def _validate_models_loaded(models: dict[str, YOLO]) -> None:
    """Check that all three canonical hazard models were loaded."""
    missing = [hazard for hazard in CANONICAL_HAZARDS if hazard not in models]
    if missing:
        raise RuntimeError(f"Failed to load model(s) for hazard(s): {missing}")


def _validate_detections(detections: list[dict[str, Any]]) -> None:
    """Check that every detection matches the canonical schema shape.

    Verifies each detection's hazard is canonical, confidence is a float in
    [0, 1], and bounding_box has exactly 4 numeric values.
    """
    for detection in detections:
        hazard = detection["hazard"]
        if hazard not in CANONICAL_HAZARDS:
            raise ValueError(f"Non-canonical hazard in detection: {hazard!r}")

        confidence = detection["confidence"]
        if not isinstance(confidence, float) or not (0.0 <= confidence <= 1.0):
            raise ValueError(f"Confidence out of [0, 1] range or not a float: {confidence!r}")

        bounding_box = detection["bounding_box"]
        if len(bounding_box) != 4 or not all(isinstance(v, (int, float)) for v in bounding_box):
            raise ValueError(f"bounding_box must contain exactly 4 numeric values: {bounding_box!r}")
