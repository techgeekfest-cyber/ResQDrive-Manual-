"""Developer smoke test for ResQDriveInference.

Loads the three hazard specialist models (flood, pothole, fallen_tree) via
`ResQDriveInference` and runs them on one image given on the command line,
printing the combined list of canonical detections as formatted JSON.

Model paths are resolved the normal way (via `RESQDRIVE_MODEL_DIR`, or its
`ai/models/` default -- see `ai/inference/README.md`); this script never
hardcodes a model path itself.

Usage:
    python test_inference.py <path/to/image.jpg>
"""

import json
import sys

try:
    from .inference import ResQDriveInference
except ImportError:
    from inference import ResQDriveInference


def main() -> None:
    """Parse the image path argument, run inference, and print JSON results."""
    if len(sys.argv) != 2:
        print("Usage: python test_inference.py <path/to/image.jpg>")
        sys.exit(1)

    image_path = sys.argv[1]

    model = ResQDriveInference()
    detections = model.infer(image_path)

    print(json.dumps(detections, indent=2))


if __name__ == "__main__":
    main()
