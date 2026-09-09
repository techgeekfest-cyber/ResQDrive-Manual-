# ai/models/pothole/

This directory is where the trained `best.pt` weights for the **pothole**
detector belong once produced by `ai/notebooks/pothole_training.ipynb` in
Google Colab.

Weight files (`*.pt`) are intentionally **not committed to git** (see
repo-root `.gitignore` and `docs/PHASE1.md`). After downloading
`best.pt` from Colab, place it here as:

    ai/models/pothole/best.pt

so the (future, Phase 2) inference module can find it at a predictable path.
