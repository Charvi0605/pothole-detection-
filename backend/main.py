from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from pathlib import Path
from datetime import datetime
import uuid
import os

from dotenv import load_dotenv
from pymongo import MongoClient


# =========================
# LOAD ENVIRONMENT VARIABLES
# =========================

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")


# =========================
# MONGODB CONNECTION
# =========================

client = MongoClient(MONGODB_URL)

db = client["pothole_database"]
reports_collection = db["reports"]

try:
    client.admin.command("ping")
    print("MongoDB connected successfully!")
except Exception as e:
    print("MongoDB connection failed:", e)


# =========================
# FASTAPI APP
# =========================

app = FastAPI()


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# YOLO MODEL
# =========================

MODEL_PATH = Path(__file__).parent / "best.pt"

model = YOLO(str(MODEL_PATH))


# =========================
# HOME ROUTE
# =========================

@app.get("/")
def home():
    return {
        "message": "Pothole Detection API is running!"
    }


# =========================
# PREVIOUS REPORTS ROUTE
# =========================

@app.get("/reports")
def get_reports():
    reports = list(reports_collection.find().sort("created_at", -1))

    formatted_reports = []
    for report in reports:
        formatted_reports.append({
            "report_id": str(report.get("_id", "")),
            "filename": report.get("filename", "Unknown file"),
            "latitude": report.get("latitude"),
            "longitude": report.get("longitude"),
            "detections": report.get("detections", []),
            "created_at": (
                report["created_at"].isoformat()
                if report.get("created_at")
                else None
            ),
        })

    return formatted_reports


# =========================
# DETECTION ROUTE
# =========================

@app.post("/detect")
async def detect_image(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...)
):

    # Create temporary filename
    file_name = f"temp_{uuid.uuid4()}_{file.filename}"

    # Save uploaded image temporarily
    with open(file_name, "wb") as buffer:
        buffer.write(await file.read())

    try:

        # =========================
        # YOLO PREDICTION
        # =========================

        results = model.predict(
            source=file_name,
            conf=0.25
        )

        detections = []

        # =========================
        # PROCESS DETECTIONS
        # =========================

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                # Bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class": model.names[class_id],
                    "confidence": round(confidence, 3),

                    "box": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2)
                    }
                })

        # =========================
        # CREATE MONGODB REPORT
        # =========================

        report = {
            "filename": file.filename,
            "latitude": latitude,
            "longitude": longitude,
            "detections": detections,
            "created_at": datetime.utcnow()
        }

        # Save report to MongoDB
        result = reports_collection.insert_one(report)

        # =========================
        # RETURN RESPONSE
        # =========================

        return {
            "filename": file.filename,
            "latitude": latitude,
            "longitude": longitude,
            "detections": detections,
            "report_id": str(result.inserted_id),
            "message": "Image analyzed successfully!"
        }

    finally:

        # Delete temporary image
        Path(file_name).unlink(missing_ok=True)