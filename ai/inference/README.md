# Inference contract (not implemented yet)

This directory intentionally contains only `schema.py` in Phase 1. It fixes
the output contract that the real Phase 2 inference module will implement:

- Load `ai/models/<hazard>/best.pt` for each of `flood`, `pothole`, `fallen_tree`.
- Run each model independently on an input image (three specialist models,
  not one multi-class model — this matches how the three source datasets
  were trained separately in `ai/notebooks/`).
- Since each model has exactly one class (index 0), map every detection from
  that model straight to the model's own hazard name.
- Convert each detection to the canonical dict via
  `schema.normalize_prediction(hazard, confidence, bounding_box)`.

Building the actual loader/API/aggregation logic is Phase 2 work and is out
of scope here.
