import { useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });

  const [location, setLocation] = useState(null);
  const [result, setResult] = useState("");
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);


  // =========================
  // IMAGE SELECTION
  // =========================

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setSelectedFile(file);
    setDetections([]);
    setResult("");

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // =========================
  // GET LOCATION
  // =========================

  const getLocation = () => {
    if (!navigator.geolocation) {
      setResult("Geolocation is not supported by this browser.");
      return;
    }

    setResult("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setResult("Location obtained successfully!");
      },
      (error) => {
        console.error(error);
        setResult("Unable to get your location.");
      }
    );
  };

  // =========================
  // UPLOAD IMAGE
  // =========================

  const uploadImage = async () => {
    if (!selectedFile) {
      setResult("Please select an image first.");
      return;
    }

    if (!location) {
      setResult("Please get your location first.");
      return;
    }

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);

    try {
      setLoading(true);
      setResult("Analyzing image...");

      const response = await axios.post(
        "http://127.0.0.1:8000/detect",
        formData
      );

      const detectedItems = response.data.detections;

      setDetections(detectedItems);

      if (detectedItems.length === 0) {
        setResult("No road damage detected.");
      } else {
        const potholeCount = detectedItems.filter(
          (item) => item.class === "pothole"
        ).length;

        const highestConfidence = Math.max(
          ...detectedItems.map((item) => item.confidence)
        );

        setResult(
          `Analysis complete — ${potholeCount} pothole(s) detected.`
        );
      }
    } catch (error) {
      console.error(error);
      setResult("Failed to analyze image. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

      <header className="header">
        <div>
          <div className="logo">
            🛣️ RoadGuard AI
          </div>

          <p className="tagline">
            AI-powered road damage detection
          </p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Ready
        </div>
      </header>


      {/* =========================
          HERO
      ========================= */}

      <section className="hero">

        <div className="hero-text">

          <span className="badge">
            AI ROAD ANALYSIS
          </span>

          <h1>
            Detect road damage
            <br />
            <span>with AI.</span>
          </h1>

          <p>
            Upload a road image and our AI model will identify
            potholes and road cracks while recording their location.
          </p>

        </div>

      </section>


      {/* =========================
          MAIN GRID
      ========================= */}

      <main className="main-grid">

        {/* =========================
            UPLOAD CARD
        ========================= */}

        <section className="card upload-card">

          <div className="card-header">
            <div>
              <h2>Upload Road Image</h2>
              <p>Select an image for AI analysis.</p>
            </div>

            <div className="card-icon">
              📷
            </div>
          </div>


          <label className="upload-area">

            {previewUrl ? (
              <div className="preview-wrapper">

                <img
                  src={previewUrl}
                  alt="Selected road"
                  onLoad={(event) => {
                    setImageSize({
                      width: event.target.naturalWidth,
                      height: event.target.naturalHeight,
                    });
                  }}
                />

                {imageSize.width > 0 &&
                  detections.map((detection, index) => {

                    const scale = 500 / imageSize.width;

                    const left =
                      detection.box.x1 * scale;

                    const top =
                      detection.box.y1 * scale;

                    const width =
                      (detection.box.x2 -
                        detection.box.x1) *
                      scale;

                    const height =
                      (detection.box.y2 -
                        detection.box.y1) *
                      scale;

                    return (
                      <div key={index}>

                        <div
                          className="bounding-box"
                          style={{
                            left: `${left}px`,
                            top: `${top}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                          }}
                        />

                        <div
                          className="detection-label"
                          style={{
                            left: `${left}px`,
                            top: `${Math.max(
                              0,
                              top - 30
                            )}px`,
                          }}
                        >
                          {detection.class}
                          {" — "}
                          {(
                            detection.confidence * 100
                          ).toFixed(1)}
                          %
                        </div>

                      </div>
                    );
                  })}

              </div>
            ) : (
              <div className="upload-placeholder">

                <div className="upload-icon">
                  ⬆
                </div>

                <h3>
                  Click to upload an image
                </h3>

                <p>
                  JPG, PNG, JPEG or other image formats
                </p>

              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

          </label>


          {/* BUTTONS */}

          <div className="button-row">

            <button
              className="secondary-button"
              onClick={getLocation}
            >
              📍 Get My Location
            </button>

            <button
              className="primary-button"
              onClick={uploadImage}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Image →"}
            </button>

          </div>


          {/* STATUS */}

          {result && (
            <div className="result-message">
              {result}
            </div>
          )}

        </section>


        {/* =========================
            DETECTION CARD
        ========================= */}

        <section className="card detection-card">

          <div className="card-header">

            <div>
              <h2>Detection Results</h2>
              <p>AI analysis of the uploaded image.</p>
            </div>

            <div className="card-icon">
              🤖
            </div>

          </div>


          {detections.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🔍
              </div>

              <h3>
                No analysis yet
              </h3>

              <p>
                Upload an image and click
                "Analyze Image" to see the results.
              </p>

            </div>

          ) : (

            <div className="results">

              <div className="summary">

                <div className="summary-number">
                  {detections.length}
                </div>

                <div>
                  <strong>
                    Detection
                    {detections.length > 1
                      ? "s"
                      : ""}
                  </strong>

                  <p>
                    Road damage identified
                  </p>
                </div>

              </div>


              {detections.map(
                (detection, index) => (

                  <div
                    className="detection-item"
                    key={index}
                  >

                    <div>

                      <strong>
                        {detection.class}
                      </strong>

                      <span>
                        Bounding box detected
                      </span>

                    </div>

                    <div className="confidence">
                      {(
                        detection.confidence *
                        100
                      ).toFixed(1)}
                      %
                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>


      {/* =========================
          LOCATION
      ========================= */}

      <section className="card location-card">

        <div className="card-header">

          <div>
            <h2>Detection Location</h2>
            <p>
              GPS coordinates and map location.
            </p>
          </div>

          <div className="card-icon">
            📍
          </div>

        </div>


        {location ? (

          <>

            <div className="coordinates">

              <div className="coordinate-box">

                <span>
                  LATITUDE
                </span>

                <strong>
                  {location.latitude.toFixed(6)}
                </strong>

              </div>

              <div className="coordinate-box">

                <span>
                  LONGITUDE
                </span>

                <strong>
                  {location.longitude.toFixed(6)}
                </strong>

              </div>

            </div>


            <MapContainer
              center={[
                location.latitude,
                location.longitude,
              ]}
              zoom={16}
              className="map"
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[
                  location.latitude,
                  location.longitude,
                ]}
              >

                <Popup>

                  <strong>
                    Road Damage Location
                  </strong>

                  <br />

                  Latitude:{" "}
                  {location.latitude}

                  <br />

                  Longitude:{" "}
                  {location.longitude}

                </Popup>

              </Marker>

            </MapContainer>

          </>

        ) : (

          <div className="location-empty">

            <div>
              📍
            </div>

            <p>
              Click "Get My Location" to display
              your current location.
            </p>

          </div>

        )}

      </section>



      {/* =========================
          FOOTER
      ========================= */}

      <footer>

        <strong>
          RoadGuard AI
        </strong>

        <span>
          AI-powered road damage monitoring system
        </span>

      </footer>


      {/* =========================
          STYLES
      ========================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background: #f4f7fb;
          color: #172033;
        }

        .app {
          min-height: 100vh;
        }

        /* HEADER */

        .header {
          background: #101828;
          color: white;
          padding: 22px 7%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 22px;
          font-weight: 800;
        }

        .tagline {
          margin: 4px 0 0;
          color: #aab4c5;
          font-size: 13px;
        }

        .status {
          background: #182438;
          border: 1px solid #2c3a50;
          padding: 9px 15px;
          border-radius: 20px;
          font-size: 13px;
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #36d399;
          border-radius: 50%;
          margin-right: 7px;
        }

        /* HERO */

        .hero {
          background: #101828;
          color: white;
          padding: 65px 7% 80px;
        }

        .hero-text {
          max-width: 850px;
        }

        .badge {
          display: inline-block;
          background: #1d2939;
          color: #98a2b3;
          border: 1px solid #344054;
          padding: 7px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .hero h1 {
          font-size: clamp(40px, 6vw, 68px);
          line-height: 1.05;
          margin: 20px 0;
          letter-spacing: -2px;
        }

        .hero h1 span {
          color: #7dd3fc;
        }

        .hero p {
          max-width: 620px;
          color: #aab4c5;
          font-size: 17px;
          line-height: 1.7;
        }

        /* MAIN */

        .main-grid {
          width: 86%;
          max-width: 1300px;
          margin: -35px auto 30px;
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 25px;
          position: relative;
        }

        .card {
          background: white;
          border: 1px solid #e4e7ec;
          border-radius: 18px;
          padding: 25px;
          box-shadow: 0 8px 30px rgba(16, 24, 40, 0.06);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .card-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .card-header p {
          margin: 6px 0 0;
          color: #667085;
          font-size: 13px;
        }

        .card-icon {
          font-size: 24px;
        }

        /* UPLOAD */

        .upload-area {
          display: block;
          border: 2px dashed #d0d5dd;
          border-radius: 15px;
          min-height: 330px;
          cursor: pointer;
          overflow: hidden;
          background: #f9fafb;
        }

        .upload-area input {
          display: none;
        }

        .upload-placeholder {
          min-height: 330px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 30px;
        }

        .upload-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e0f2fe;
          color: #0284c7;
          border-radius: 15px;
          font-size: 30px;
          margin-bottom: 15px;
        }

        .upload-placeholder h3 {
          margin: 5px 0;
        }

        .upload-placeholder p {
          color: #667085;
          font-size: 13px;
        }

        .preview-wrapper {
          position: relative;
          display: inline-block;
          max-width: 100%;
        }

        .preview-wrapper img {
          display: block;
          width: 500px;
          max-width: 100%;
          height: auto;
        }

        .bounding-box {
          position: absolute;
          border: 3px solid #ef4444;
          box-sizing: border-box;
          pointer-events: none;
        }

        .detection-label {
          position: absolute;
          background: #ef4444;
          color: white;
          padding: 5px 8px;
          border-radius: 5px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          pointer-events: none;
        }

        /* BUTTONS */

        .button-row {
          display: flex;
          gap: 12px;
          margin-top: 18px;
        }

        button {
          border: none;
          cursor: pointer;
          font: inherit;
          font-weight: 700;
          border-radius: 10px;
          padding: 13px 18px;
        }

        .primary-button {
          background: #101828;
          color: white;
          flex: 1;
        }

        .primary-button:hover {
          background: #1d2939;
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-button {
          background: #eef2f6;
          color: #344054;
        }

        .result-message {
          margin-top: 15px;
          background: #f0f9ff;
          color: #0369a1;
          border-radius: 10px;
          padding: 12px;
          font-size: 13px;
        }

        /* DETECTIONS */

        .empty-state {
          min-height: 330px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .empty-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        .empty-state h3 {
          margin: 5px;
        }

        .empty-state p {
          color: #667085;
          font-size: 13px;
          line-height: 1.6;
          max-width: 250px;
        }

        .summary {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #f8fafc;
          padding: 18px;
          border-radius: 13px;
          margin-bottom: 15px;
        }

        .summary-number {
          font-size: 35px;
          font-weight: 800;
        }

        .summary p {
          margin: 4px 0;
          color: #667085;
          font-size: 12px;
        }

        .detection-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #eaecf0;
          padding: 15px;
          border-radius: 11px;
          margin-bottom: 10px;
        }

        .detection-item strong {
          display: block;
          text-transform: capitalize;
        }

        .detection-item span {
          display: block;
          color: #667085;
          font-size: 11px;
          margin-top: 4px;
        }

        .confidence {
          font-weight: 800;
          color: #0284c7;
        }

        /* LOCATION */

        .location-card {
          width: 86%;
          max-width: 1300px;
          margin: 30px auto;
        }

        .coordinates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 18px;
        }

        .coordinate-box {
          background: #f8fafc;
          border: 1px solid #eaecf0;
          padding: 15px;
          border-radius: 12px;
        }

        .coordinate-box span {
          display: block;
          font-size: 10px;
          color: #667085;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }

        .coordinate-box strong {
          font-size: 16px;
        }

        .map {
          height: 420px;
          width: 100%;
          border-radius: 14px;
          overflow: hidden;
        }

        .location-empty {
          min-height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #667085;
          text-align: center;
        }

        .location-empty div {
          font-size: 45px;
          margin-bottom: 10px;
        }

        /* FOOTER */

        footer {
          width: 86%;
          max-width: 1300px;
          margin: 45px auto;
          padding: 25px 0;
          border-top: 1px solid #e4e7ec;
          display: flex;
          justify-content: space-between;
          color: #667085;
          font-size: 12px;
        }


        /* RESPONSIVE */

        @media (max-width: 900px) {

          .main-grid {
            grid-template-columns: 1fr;
          }

          .hero {
            padding-top: 45px;
          }

        }

        @media (max-width: 600px) {

          .header {
            padding: 18px 5%;
          }

          .status {
            display: none;
          }

          .hero {
            padding: 45px 5% 70px;
          }

          .main-grid,
          .location-card {
            width: 92%;
          }


          .button-row {
            flex-direction: column;
          }

          .coordinates {
            grid-template-columns: 1fr;
          }

          footer {
            width: 92%;
            flex-direction: column;
            gap: 8px;
          }

        }

      `}</style>

    </div>
  );
}

export default Home;