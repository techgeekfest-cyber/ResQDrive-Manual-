"""Phase 2 inference configuration: canonical hazards and model paths.

Each hazard has a trained YOLO specialist model (`best.pt`), placed under a
models directory that is git-ignored (see `docs/PHASE1.md`). This module
resolves where each hazard's weights file lives, without hardcoding any
user-specific absolute path.

Model directory resolution order:
    1. The `RESQDRIVE_MODEL_DIR` environment variable, if set.
    2. Otherwise, `ai/models/` relative to the repository root (this file's
       location is used to find the repo root, so it works regardless of the
       caller's current working directory).
"""

import os
from pathlib import Path

# flood, pothole, fallen_tree -- one single-class specialist model each.
# Re-exported from schema.py so both modules share a single source of truth.
#
# This module is used two ways (see ai/inference/README.md): imported as
# part of the repository package (`from ai.inference import config`), or run
# flat from inside ai/inference/ (`python inference.py` with this directory
# on sys.path). The relative import handles the former; if that fails
# because there's no enclosing package, we fall back to the flat import.
try:
    from .schema import CANONICAL_HAZARDS
except ImportError:
    from schema import CANONICAL_HAZARDS

# ai/inference/config.py -> ai/inference -> ai -> <repo root>
_REPO_ROOT = Path(__file__).resolve().parents[2]

# Default location for model weights when RESQDRIVE_MODEL_DIR is not set.
_DEFAULT_MODEL_DIR = _REPO_ROOT / "ai" / "models"

# Weights filename each hazard's training notebook produces.
_MODEL_FILENAME = "best.pt"


def get_model_dir() -> Path:
    """Return the root directory that contains per-hazard model subfolders.

    Reads the `RESQDRIVE_MODEL_DIR` environment variable if set, otherwise
    falls back to `ai/models` relative to the repository root.
    """
    env_value = os.environ.get("RESQDRIVE_MODEL_DIR")
    if env_value:
        return Path(env_value).expanduser().resolve()
    return _DEFAULT_MODEL_DIR


def get_model_path(hazard: str) -> Path:
    """Return the expected weights path (`<model_dir>/<hazard>/best.pt`) for a hazard.

    Args:
        hazard: One of CANONICAL_HAZARDS ("flood", "pothole", "fallen_tree").

    Raises:
        ValueError: If `hazard` is not a canonical hazard name.
    """
    if hazard not in CANONICAL_HAZARDS:
        raise ValueError(f"Unknown hazard {hazard!r}, expected one of {CANONICAL_HAZARDS}")
    return get_model_dir() / hazard / _MODEL_FILENAME
