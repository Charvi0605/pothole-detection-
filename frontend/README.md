# 🛣️ RoadGuard AI
### AI-Powered Road Damage Detection System

RoadGuard AI is a full-stack web application that uses Artificial Intelligence
to detect potholes and road cracks from uploaded road images. It displays
detection results, bounding boxes, confidence scores, and GPS coordinates.

Detection reports are stored in MongoDB Atlas and can be viewed later through
the Previous Reports page.

## ✨ Features

- 📷 Upload road images for analysis.
- 🤖 Detect potholes and road cracks using YOLO.
- 🔴 Display bounding boxes around detected damage.
- 🎯 Display model confidence scores.
- 📍 Capture the user's current GPS coordinates.
- 🗺️ Display the recorded location on a map.
- 💾 Store detection reports in MongoDB Atlas.
- 📋 View previously saved reports.
- 🔄 Refresh the report list.
- 🌐 Navigate between Home and Reports pages.

## 🧰 Technologies Used

### Frontend
- React
- Vite
- JavaScript
- Axios
- React Router
- React Leaflet
- Leaflet

### Backend
- Python
- FastAPI
- Uvicorn
- Ultralytics YOLO
- PyMongo

### Database
- MongoDB Atlas

## 🏗️ Project Structure

```text
pothole-detection/
├── backend/
│   ├── main.py
│   ├── best.pt
│   ├── .env
│   └── venv/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Home.jsx
│   │   ├── Reports.jsx
│   │   └── Navbar.jsx
│   ├── package.json
│   └── ...
├── dataset/
└── README.md