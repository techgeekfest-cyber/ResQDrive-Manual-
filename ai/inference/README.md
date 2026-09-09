# Inference (Phase 2)

This directory holds the Phase 2 inference foundation: loading the three
Phase 1 hazard specialist models and running them together on one image.

- `schema.py` -- canonical output contract (`normalize_prediction()`,
  `CANONICAL_HAZARDS`), fixed in Phase 1.
- `config.py` -- resolves where each hazard's trained `best.pt` lives.
- `inference.py` -- `ResQDriveInference`, which loads all three models and
  runs them on an image.

Each Phase 1 model is a **single-class specialist** (flood, pothole, and
fallen_tree are three separate `best.pt` files, not one multi-class model).
`ResQDriveInference` runs all three independently on the same image and
merges their detections into one list -- it does not combine them into a
single model.

## Configuring model paths

By default, model weights are expected at:

```
ai/models/<hazard>/best.pt
```

resolved relative to the repository root (see `docs/PHASE1.md` for how
`best.pt` gets there -- weight files are git-ignored and produced by running
the Colab training notebooks).

To point at a different location (e.g. a shared weights directory), set the
`RESQDRIVE_MODEL_DIR` environment variable:

```bash
export RESQDRIVE_MODEL_DIR=/path/to/your/model/dir
# expects /path/to/your/model/dir/flood/best.pt, .../pothole/best.pt, .../fallen_tree/best.pt
```

`config.get_model_path(hazard)` returns the resolved `Path` for one hazard,
and validates that `hazard` is one of `CANONICAL_HAZARDS`
(`"flood"`, `"pothole"`, `"fallen_tree"`).

## Usage

Run from within this directory (or with it on `PYTHONPATH`) so the flat
`schema` / `config` / `inference` modules can import each other:

```python
from inference import ResQDriveInference

# Loads all three specialist models (flood, pothole, fallen_tree) once.
model = ResQDriveInference()

# Accepts a file path...
detections = model.infer("path/to/image.jpg", conf=0.25)

# ...or an in-memory numpy image, e.g. from OpenCV:
import cv2
frame = cv2.imread("path/to/image.jpg")
detections = model.infer(frame, conf=0.25)
```

## Expected output

`infer()` returns a list of canonical detection dicts, one per detected
hazard box across all three models:

```json
[
  {"hazard": "flood", "confidence": 0.92, "bounding_box": [10.0, 20.0, 210.0, 180.0]},
  {"hazard": "pothole", "confidence": 0.77, "bounding_box": [305.0, 140.0, 360.0, 190.0]}
]
```

The list may be empty (no hazards above `conf`), contain detections from a
single model, or contain detections from multiple models on the same image.

## Dependencies

This module requires `ultralytics` and `numpy` to be installed in your
Python environment. Per project convention, dependencies are not installed
automatically from this code. They're listed in `ai/inference/requirements.txt`;
install them yourself with:

```bash
pip install -r ai/inference/requirements.txt
```

## Out of scope here (Phase 3+)

GPS tagging, timestamps, persistence/database storage, a web API (FastAPI),
and evidence fusion/risk scoring across detections are **not** implemented
in this directory -- they are later-phase work described in the project
README.
