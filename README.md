# RoadGuard — AI Pothole Detection

IBM Z DATHATHON 2026 | SSF2026 | TEAM OG GANG

<p align="center">
  <img src="docs/screenshots/detection-loop-output.png" alt="RoadGuard pothole detection output" width="920" />
</p>

<p align="center"><strong>AI-assisted road inspection for faster, clearer, and more reviewable pothole screening.</strong></p>

<p align="center">
  <a href="https://jupyter.org/"><img src="https://img.shields.io/badge/JupyterLab-ready-F37626?logo=jupyter&logoColor=white" alt="JupyterLab ready"></a>
  <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white" alt="Python 3.10+"></a>
  <a href="https://docs.ultralytics.com/"><img src="https://img.shields.io/badge/YOLO-Ultralytics-111827" alt="Ultralytics YOLO"></a>
  <a href="https://www.ibm.com/linuxone"><img src="https://img.shields.io/badge/LinuxONE-ready-052FAD?logo=linux&logoColor=white" alt="LinuxONE ready"></a>
</p>

TEAM OG GANG
____________________________________________
• PRAJWAL M
• NIKIL GOWDA M
• PRAJWAL GOWDA B S
• KIRAN B A

> **Project status:** reproducible prototype. The notebook trains a one-class YOLO detector for visible potholes; the included browser demo communicates the workflow with a real road image and a looping detection-output animation. A human inspector remains responsible for verification and maintenance decisions.


## Project at a glance

Potholes are difficult to monitor consistently at city scale. Manual inspection is time-consuming, reporting can be delayed, and teams need visual evidence to decide which locations should be checked first. RoadGuard turns a road image into a focused detection output: a suspected pothole region, a confidence-bearing model prediction in the notebook workflow, and an annotated frame that a person can review.

The repository is intentionally split into two connected deliverables:

| Deliverable | What it provides |
|---|---|
| **Linux/Jupyter computer-vision pipeline** | Dataset download, Pascal VOC-to-YOLO conversion, training, validation, image inference, video inference, webcam example, and export notes. |
| **RoadGuard browser demo** | Professional responsive UI, real pothole input image, autoplay detection loop, interactive scan animation, highlighted output region, benefits, and human-review disclaimer. |

## Screenshots

### Desktop project UI

![RoadGuard desktop interface](docs/screenshots/ui-desktop-full.png)

### Mobile-responsive UI

![RoadGuard mobile interface](docs/screenshots/ui-mobile.png)

### Detection output

![RoadGuard detection output](docs/screenshots/detection-loop-output.png)

The detection-loop image is a visual prototype output for demonstrating the product flow. It does not claim a measured benchmark result. The notebook is the source of truth for training and evaluation metrics after the user runs it on the selected dataset.

## Run the notebook (Linux, Windows, or Colab)

### 1. Clone and enter the repository

```bash
git clone https://github.com/gt1432/AI-POTHOLES-DETECTION.git
cd AI-POTHOLES-DETECTION
```

### 2. Create a virtual environment

```bash
python -m venv .venv
# On Linux/macOS:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

python -m pip install --upgrade pip
pip install -r requirements-full-training.txt
```

### 3. Prepare the dataset

The default pipeline downloads the official RDD2022 India archive and converts its Pascal VOC XML annotations into YOLO format while retaining the RDD2022 `D40` pothole class.

```bash
python scripts/prepare_rdd2022.py --root data
```

### 4. Open JupyterLab

```bash
jupyter lab
```

Open `notebooks/ROADGUARD.ipynb` and run the cells in order. The notebook automatically uses CUDA when available; otherwise it falls back to CPU.

### 5. Expected outputs

After a successful run, the main artifacts are normally located at:

```text
runs/pothole_yolo/weights/best.pt     # best trained checkpoint
runs/pothole_yolo/                    # training charts and validation outputs
runs/predict/                         # annotated prediction images
```

## Cloud Deployment on Render

This repository includes a production-ready FastAPI backend (`app.py`), full web demo interface (`web_demo/public`), and automatic Render configuration (`render.yaml` Blueprint and `Procfile`).

### Option A: 1-Click Render Blueprint (Recommended)
1. In your Render Dashboard, click **New +** -> **Blueprint**.
2. Connect your repository: `https://github.com/gt1432/AI-POTHOLES-DETECTION`.
3. Render automatically reads `render.yaml`, configures the build and start commands, and provisions the web service.

### Option B: Manual Web Service on Render
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect `https://github.com/gt1432/AI-POTHOLES-DETECTION`.
3. Configure the following settings:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
4. Click **Deploy Web Service**.

Once deployed, your service URL will be live at `https://<service-name>.onrender.com`.

## Run the Web Demo Locally

### Python FastAPI (Full UI + Inference API):
```bash
python app.py
```
Open `http://localhost:8000` in your browser.

### Node.js Preview:
```bash
npm start
```
Open `http://localhost:3000` in your browser.

## Repository structure

```text
.
├── app.py
├── package.json
├── Procfile
├── render.yaml
├── requirements.txt
├── requirements-full-training.txt
├── README.md
├── notebooks/
│   ├── ROADGUARD.ipynb
│   └── fastapi_inference_server.py
├── scripts/
│   ├── prepare_rdd2022.py
│   └── create_notebook.py
├── data/
│   └── README.md
├── docs/
│   ├── PROJECT_REPORT.md
│   ├── PROJECT_REPORT.pdf
│   ├── pitch_deck.md
│   ├── pitch_deck.pdf
│   ├── submission_form_answers.md
│   └── screenshots/
└── web_demo/
    ├── package.json
    ├── server.js
    └── public/
        ├── index.html
        ├── styles.css
        ├── app.js
        ├── pothole.jpg
        └── pothole-loop.mp4
```

## Dataset and model details

The default dataset path uses **RDD2022 India**, a road-damage dataset with Pascal VOC XML annotations. The converter keeps the pothole class `D40` and maps it to one YOLO class named `pothole`. The repository also documents Pothole-600 as an optional external dataset for future experiments; it is not downloaded automatically by the notebook.

The model workflow uses a pretrained Ultralytics YOLO detector and transfer learning. Training and inference settings are kept in the notebook so that the experiment is easy to inspect, modify, and reproduce.

## LinuxONE relevance

RoadGuard is designed as a Linux-native Python and Jupyter workflow that can be containerized and operationalized on LinuxONE. A future service can ingest survey-vehicle or smartphone frames, run batch inference, and write reviewable detections to an auditable CSV, object store, GIS system, or road-maintenance workflow. LinuxONE is relevant for enterprise security, centralized operations, repeatable environments, scalability, and high availability.

This project does **not** claim a proprietary IBM accelerator or production accuracy. It demonstrates a Linux-ready workload and a responsible path from notebook experimentation to an operational inspection-support service.

## Limitations and responsible use

RoadGuard detects visible visual patterns; it does not measure pothole depth, structural severity, repair cost, road ownership, or legal responsibility. Accuracy can vary with night scenes, rain, glare, camera angle, motion blur, occlusion, and local road styles. Before operational use, collect representative local imagery, calibrate the confidence threshold, test on a geographically held-out set, measure false positives per frame or kilometer, and require human verification.

## Project documents

- [Project report PDF](docs/PROJECT_REPORT.pdf)
- [Dataset folder notes](data/README.md)

## Open-source resources and attribution

1. [RDD2022 Figshare record](https://figshare.com/articles/dataset/RDD2022_-_The_multi-national_Road_Damage_Dataset_released_through_CRDDC_2022/21431547)
2. [Pothole-600 project page](https://sites.google.com/view/pothole-600/dataset)
3. [Ultralytics Python usage](https://docs.ultralytics.com/usage/python/)
4. [Ultralytics repository](https://github.com/ultralytics/ultralytics)
5. [OpenCV](https://opencv.org/)
6. [Jupyter](https://jupyter.org/)

Review the current license terms for each dependency, dataset, and model before commercial or public-sector deployment.

