# Phase 1 -- AI Dataset Preparation, YOLO Training, Validation & Testing

**Scope:** this phase covers dataset preparation and training/evaluation of
three lightweight YOLO hazard detectors only. It does **not** include any
backend, database, frontend, routing, or dashboard work -- that is Phase 2+.

## Status (as of this writing)

**Not yet complete.** The repository structure, dataset inspection, model
choice, and fully-scripted Colab notebooks exist. The models themselves have
**not** been trained yet, because training requires a Google Colab GPU
runtime, which this environment (a local Mac session driving the repo) does
not have and was explicitly told not to fake. Actually running each notebook
in Colab and recording its real metrics below is the remaining work before
Phase 1 can be declared done. See "Definition of done" at the bottom.

## Directory structure

```
ai/
  training/           # per-dataset scratch space (dataset downloads/conversions live here at Colab runtime, not committed)
    flood/
    pothole/
    fallen_tree/
  notebooks/          # the three self-contained Colab notebooks (see below)
  inference/          # canonical output schema only -- no API yet (Phase 2)
  models/             # best.pt goes here per hazard (git-ignored, see below)
    flood/
    pothole/
    fallen_tree/
docs/
  PHASE1.md           # this file
```

## Datasets

| Hazard | Source | License | Images | Splits (declared) | Native format |
|---|---|---|---|---|---|
| flood | [Roboflow: wo-q0mut/flood-detection-3susv-wbjhi, v1](https://universe.roboflow.com/wo-q0mut/flood-detection-3susv-wbjhi/dataset/1) | CC BY 4.0 | 982 | 688 train / 196 valid / 98 test (70/20/10) | Already YOLO-exportable |
| pothole | [Kaggle dsv/973710](https://www.kaggle.com/dsv/973710) → `chitholian/annotated-potholes-dataset` (verified, see below) | see Kaggle page | 665 (1332 files = 665 images + 665 XML + splits.json + README) | 80% train / 20% test via `splits.json`, **no val split provided** | LabelImg-style XML with `<filename>`/`<bndbox>` tags (commonly called "Pascal VOC XML"; converted to YOLO by the notebook) |
| fallen_tree | [Roboflow: hazard-detection-kzrtt/fallen-tree-e4f2f](https://universe.roboflow.com/hazard-detection-kzrtt/fallen-tree-e4f2f) | CC BY 4.0 | **63 (small!)** | ~40 train / 14 valid / 9 test | Already YOLO-exportable |

These counts and class names come from each project's public listing page.
**They are not trusted blindly** -- every notebook re-derives them from the
actual downloaded files in its "Inspect dataset" and "Verify labels" steps,
and stops with an explicit error rather than silently proceeding if the real
data disagrees with what's documented here.

Direct automated scraping of the Roboflow and Kaggle dataset pages (to gather
the table above) was blocked by their anti-bot protections (Cloudflare 403 on
Roboflow, a reCAPTCHA challenge page on Kaggle) -- this is expected and does
not affect the notebooks, which authenticate through the official
`roboflow` SDK and `kaggle` CLI instead of scraping HTML.

### Verified: `kaggle.com/dsv/973710` == `chitholian/annotated-potholes-dataset`

This was not assumed -- it was checked with two independent pieces of
evidence pulled from the live pages (via a text-extraction proxy, since raw
`curl`/browser fetches of Kaggle trigger a reCAPTCHA challenge before
rendering content):

1. Fetching `https://www.kaggle.com/dsv/973710` directly (with cache
   disabled to rule out a stale/misattributed cache entry) returns a
   server-rendered `<title>` of **"Annotated Potholes Image Dataset"** --
   the exact title of the chitholian dataset page, with no other Kaggle
   dataset sharing that title in search results.
2. The chitholian dataset page's own cover-image asset URL is
   `https://storage.googleapis.com/kaggle-datasets-images/531821/973710/.../dataset-cover.jpg`
   -- the number **973710** appears directly inside that dataset's own
   asset path (Kaggle keys dataset-version assets by internal version id).
   This is Kaggle's internal identifier for this exact dataset appearing in
   two unrelated places, not a title coincidence.

Both signals point to the same dataset, so the notebook downloads it via the
stable slug `chitholian/annotated-potholes-dataset` (numeric `dsv` ids are
not valid `kaggle` CLI targets; the slug is the correct API-facing
identifier for the same dataset):

```
!kaggle datasets download -d chitholian/annotated-potholes-dataset -p /content/raw_pothole --unzip
```

What was **not** independently verified (would require an authenticated
download, which this environment intentionally does not perform): the exact
literal string inside each XML `<name>` tag. Kaggle's own page confirms a
single pothole class conceptually but doesn't quote the tag value. The
notebook's "Verify labels" step reads every XML file's real `<name>` values
at runtime and only proceeds if they're all in a small synonym set
(`pothole`, `potholes`, `Pothole`, `Potholes`, `pot-hole`, `pot_hole`);
anything else halts the notebook for manual review.

**Bug found and fixed during this verification pass:** the pothole notebook's
train/val/test-split logic compared `splits.json` entries (which Kaggle's own
README confirms are **`.xml` filenames**, e.g. `"img-565.xml"`) directly
against the image lookup table (keyed by **`.jpg` filenames**). Because of
the extension mismatch, every membership check silently failed and every
image would have fallen into the `train` bucket -- meaning the original 20%
held-out test set from `splits.json` would never actually have been honored,
despite the notebook believing it was preserving it. Fixed by normalizing
`splits.json` entries to `.jpg` before comparison, plus an added
`assert len(test_files) > 0` guard so this class of bug fails loudly instead
of silently if it ever recurs.

**Bug found and fixed after a real Colab run (flood/fallen_tree path
resolution):** running `flood_training.ipynb` in Colab surfaced that Step 3
reported `train: 0 images`, `val: 0 images`, `test: 0 images`, resolving to
paths like `/content/flood-detection-1/../train/images` -- one directory
above where the images actually live
(`/content/flood-detection-1/train/images`, confirmed 688/196/98 images by
direct inspection). Cause: Roboflow's exported `data.yaml` declares split
paths with a leading `../` (e.g. `test: ../test/images`), and the notebook
was joining that literal string onto `DATASET_DIR`, landing one level too
high. `fallen_tree_training.ipynb` downloads via the same Roboflow YOLOv8
export pipeline and had the identical bug (pothole builds its own
self-authored `data.yaml` with a `path:` key and was not affected). Fixed in
both notebooks with a `resolve_split_dir()` helper that tries the literal
declared path first, then the same path with any leading `../`/`./`
stripped, and uses whichever candidate is an actual existing directory --
plus an explicit `assert os.path.isdir(...)` per split so an unresolvable
directory fails loudly in Step 3 instead of silently reporting 0 images.
The same resolved directories (`SPLIT_DIRS`) are reused, not re-derived,
when writing the final `data.yaml` fed to `model.train()`/`model.val()`, so
training can't silently point at empty directories either. While fixing
this, a related bug was also found and fixed in the shared
"sample predictions on unseen images" cell (used by all three notebooks):
a full path expression was being `repr()`-quoted into a literal string
instead of evaluated as code, so `glob.glob()` was searching for a file
literally named `"os.path.join(...)"` and always found zero images.

### Class-name normalization

Per-dataset public listings show **exactly one class per dataset**, already
matching our desired canonical names:

- flood dataset -> class `flood`
- pothole dataset -> XML `<name>` tag expected to be some case/pluralization
  variant of `pothole`
- fallen_tree dataset -> class `fallen_tree`

Even so, **no notebook assumes this is true** -- each one has an explicit
"Verify labels" step that enumerates every class name/id actually present in
the downloaded annotation files and prints it, followed by a "Class
normalization" step that either confirms the match or **stops with an error**
if an unexpected or additional class shows up, rather than silently dropping
it. If a real run ever surfaces more than one class in one of these
datasets, that is a decision point requiring a human call (train on it as an
additional hazard class vs. explicitly excluding it with a documented
reason) -- not something to auto-resolve.

### Why three separate single-class models (not one multi-class model)

The three datasets come from different sources with different formats,
licenses, and image distributions. Training three independent specialist
models keeps each pipeline simple and matches the requested deliverable
(`flood/best.pt`, `pothole/best.pt`, `fallen_tree/best.pt`). The canonical
inference schema (`ai/inference/schema.py`) is designed so a future combined
inference step can treat all three the same way regardless of this choice.

### Pothole dataset: conversion & split details

The Kaggle dataset ships Pascal VOC XML, not YOLO txt, so
`pothole_training.ipynb` converts every `<object><bndbox>` into a normalized
YOLO label line itself (documented inline in the notebook). It also has no
validation split, only an 80/20 train/test `splits.json`. The notebook:

1. Keeps the original 20% test set fully untouched as the final unseen-data
   evaluation set (satisfies Phase 1's "unseen images" requirement).
2. Carves the 80% training portion further into ~85/15 train/val, so
   training can still be monitored against a validation set that was never
   used for gradient updates.

### Fallen-tree dataset: small-sample caveat

At ~63 images, this is a small dataset for object detection. The notebook
uses transfer learning from COCO-pretrained YOLO26n weights plus
Ultralytics' default augmentations to compensate, but metrics from this
model should be read as a prototype signal, not a production benchmark. If
the resulting TEST mAP50 is very low or sample predictions look unreliable,
that is a legitimate **blocking dataset issue** to document here rather than
something to paper over -- the documented remedy would be sourcing more
fallen-tree images before Phase 2, not fabricating better numbers.

## Model choice: YOLO26n (nano)

[Ultralytics YOLO26](https://docs.ultralytics.com/models/yolo26) (released
January 2026) is the current generation of the YOLO family. The **nano**
variant (`yolo26n.pt`) was chosen because:

- ~2.4M parameters -- smallest variant in the family, fastest to train and
  to run at inference time, appropriate for a hackathon/SIH prototype and
  for eventual edge/CPU deployment (~1.7ms/image on a T4 GPU, up to 43%
  faster than prior generations on CPU).
- Native end-to-end (NMS-free) inference head, simplifying later deployment.
- Actively maintained by Ultralytics with a stable, well-documented Python
  API (`pip install ultralytics`, `YOLO("yolo26n.pt")`).

Each notebook has an automatic fallback to `yolo11n.pt` if the installed
`ultralytics` version in a given Colab session doesn't yet resolve
`yolo26n.pt`, so a stale environment doesn't block training entirely; the
actual weights file used is recorded in that run's metrics summary.

Larger variants (s/m/l/x) were deliberately not used -- they would slow down
iteration for no accuracy benefit given how small these datasets are.

## Credential setup (required before running any notebook)

Do not paste API keys/tokens into any cell or commit them anywhere in this
repository. Both notebooks read credentials from **Google Colab Secrets**
(the key icon in Colab's left sidebar):

**Roboflow** (`flood_training.ipynb`, `fallen_tree_training.ipynb`):
1. Get a free API key at https://app.roboflow.com/settings/api
2. In Colab: Secrets panel -> add `ROBOFLOW_API_KEY` -> paste the key -> enable "Notebook access"

**Kaggle** (`pothole_training.ipynb`):
1. Kaggle -> your profile -> Settings -> API -> "Create New Token" (downloads `kaggle.json`)
2. Open that file locally, copy its `username` and `key` values
3. In Colab: Secrets panel -> add `KAGGLE_USERNAME` and `KAGGLE_KEY` -> enable "Notebook access" for both

## How to run each notebook

1. Upload the `.ipynb` file from `ai/notebooks/` to https://colab.research.google.com (File > Upload notebook), or open it directly from this GitHub repo once pushed (File > Open notebook > GitHub tab).
2. `Runtime > Change runtime type > T4 GPU` (or better, if available).
3. Set up the relevant Colab secret(s) as above.
4. `Runtime > Run all`. Each notebook is fully self-contained: install deps -> download dataset via the official API -> inspect -> verify/normalize labels -> convert to YOLO if needed -> train -> validate -> test on unseen images -> print metrics -> export `best.pt`.
5. At the end, download `best.pt` (offered automatically via `files.download`, and also copied to Google Drive under `ResQDrive/models/<hazard>/` if Drive is mounted) and place it in this repo at `ai/models/<hazard>/best.pt`.
6. Copy the printed `training_summary_<hazard>.json` contents into the results table below.

## Evaluation methodology

Each notebook captures, from the actual training run (never fabricated):

- Model architecture/weights file actually loaded (`yolo26n.pt` or the `yolo11n.pt` fallback)
- Epochs, image size, batch size, early-stopping patience
- Validation-set precision, recall, mAP50, mAP50-95
- A held-out **test-set** evaluation (mandatory, see per-dataset split notes above) with the same metrics
- The confusion matrix image Ultralytics writes to the validation run directory (displayed inline where generated)
- A grid of sample predictions rendered on unseen test images

## Results (fill in after each notebook is actually run in Colab)

| Hazard | Epochs | imgsz | batch | Val P | Val R | Val mAP50 | Val mAP50-95 | Test P | Test R | Test mAP50 | Test mAP50-95 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| flood | - | - | - | - | - | - | - | - | - | - | - |
| pothole | - | - | - | - | - | - | - | - | - | - | - |
| fallen_tree | - | - | - | - | - | - | - | - | - | - | - |

*(Not filled in yet -- no training run has been executed. Do not fill this
table with estimated or assumed numbers; paste only real
`training_summary_<hazard>.json` output.)*

## Definition of done for Phase 1

A given hazard model is only considered successfully trained once **all** of
the following are true:

1. Its notebook has been run end-to-end in Colab without unresolved errors.
2. The "Verify labels" / "Class normalization" cells passed (or any mismatch
   was explicitly resolved and documented, not silently bypassed).
3. Real validation and test metrics (P, R, mAP50, mAP50-95) have been
   recorded in the results table above, sourced from
   `training_summary_<hazard>.json`.
4. The sample-predictions grid on unseen test images has been visually
   reviewed and looks reasonable (boxes roughly on the actual hazard).
5. `best.pt` has been produced and placed at `ai/models/<hazard>/best.pt`
   locally (not committed to git per `.gitignore` -- see below).

Phase 1 as a whole is complete only once this holds for all three hazards,
or a specific blocking issue (e.g. the fallen-tree dataset being too small
to produce a usable model) has been identified and documented here.
**Creating the notebooks alone does not constitute Phase 1 completion.**

## Where model weights live

Trained `best.pt` files are **not committed to GitHub** in Phase 1 -- YOLO
weight files are binary and can be tens of MB each, and re-generating them
from the notebooks is cheap and reproducible. Instead:

- Locally: place each `best.pt` at `ai/models/<hazard>/best.pt` (git-ignored).
- The Colab notebooks additionally copy `best.pt` to
  `Google Drive: /ResQDrive/models/<hazard>/best.pt` when Drive is mounted,
  as a durable backup independent of the Colab session.
- If/when the team decides weights should be versioned in git (e.g. via
  Git LFS) for deployment, that is an explicit future decision, not the
  Phase 1 default.

## Canonical inference output (schema only, no API yet)

`ai/inference/schema.py` defines the shape every hazard model's predictions
will eventually be normalized into:

```json
{"hazard": "flood", "confidence": 0.92, "bounding_box": [x1, y1, x2, y2]}
```

Because each Phase 1 model is a single-class specialist, its one class
(index 0) always maps directly to that model's hazard name. This keeps the
three otherwise-independent models pluggable into one future inference
interface without changing how they were trained. Implementing that
interface (loading all three `best.pt` files, running inference, and serving
results) is explicitly deferred to Phase 2.

## Explicitly out of scope for Phase 1

FastAPI, PostgreSQL/PostGIS, React, Leaflet, OSRM, evidence fusion, risk
scoring, and dashboards are Phase 2+ concerns and are intentionally not
started here.
