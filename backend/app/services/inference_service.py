from pathlib import Path
import sys

# Add the ai/inference directory to Python's import path
INFERENCE_DIR = Path(__file__).resolve().parents[3] / "ai" / "inference"

if str(INFERENCE_DIR) not in sys.path:
    sys.path.insert(0, str(INFERENCE_DIR))

from inference import ResQDriveInference


# Load the models only once when the server starts
inference_model = ResQDriveInference()


def detect_hazards(image_path: str, confidence: float = 0.25):
    """
    Run ResQDrive Phase 2 inference on an image.
    """

    detections = inference_model.infer(
        image_path,
        conf=confidence
    )

    return detections