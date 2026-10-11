import { useCallback, useEffect, useState } from "react";
import axios from "axios";

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://127.0.0.1:8000/reports");
      setReports(response.data);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError("Unable to load reports. Make sure the FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="reports-page">
      <header className="reports-hero">
        <span className="reports-badge">ROAD DAMAGE MONITORING</span>
        <h1>Previous Reports</h1>
        <p>Review road damage detections saved by RoadGuard AI.</p>
      </header>

      <main className="reports-content">
        <section className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <h2>Saved reports</h2>
              <p>{reports.length} report{reports.length === 1 ? "" : "s"} in your database</p>
            </div>
            <button className="reports-refresh" onClick={fetchReports} disabled={loading}>
              {loading ? "Refreshing..." : "↻ Refresh Reports"}
            </button>
          </div>

          {loading && reports.length === 0 ? (
            <div className="reports-message">Loading previous reports...</div>
          ) : error ? (
            <div className="reports-message reports-error">{error}</div>
          ) : reports.length === 0 ? (
            <div className="reports-message">No reports yet. Go to Home and analyze an image to create your first report.</div>
          ) : (
            <div className="reports-list">
              {reports.map((report) => (
                <article className="report-card" key={report.report_id}>
                  <div className="report-heading">
                    <div className="report-title-block">
                      <h3>{report.filename || "Unnamed image"}</h3>
                      <p>{report.created_at ? new Date(report.created_at).toLocaleString() : "Date unavailable"}</p>
                    </div>
                    <span className="report-count">
                      {(report.detections || []).length} detection{(report.detections || []).length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="report-coordinates">
                    <div><span>LATITUDE</span><strong>{typeof report.latitude === "number" ? report.latitude.toFixed(6) : "Unavailable"}</strong></div>
                    <div><span>LONGITUDE</span><strong>{typeof report.longitude === "number" ? report.longitude.toFixed(6) : "Unavailable"}</strong></div>
                  </div>

                  {(report.detections || []).length > 0 ? (
                    <div className="report-detections">
                      {report.detections.map((detection, index) => (
                        <div className="report-detection-row" key={`${report.report_id}-${index}`}>
                          <span>{detection.class || "Road damage"}</span>
                          <strong>{typeof detection.confidence === "number" ? `${(detection.confidence * 100).toFixed(1)}%` : "Confidence unavailable"}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-detections">No road damage detected in this image.</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="reports-footer">
        <strong>RoadGuard AI</strong>
        <span>AI-powered road damage monitoring system</span>
      </footer>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f4f7fb; color: #172033; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .reports-page { min-height: calc(100vh - 68px); }
        .reports-hero { background: #101828; color: white; padding: 48px 7% 58px; }
        .reports-badge { display: inline-block; background: #1d2939; color: #98a2b3; border: 1px solid #344054; padding: 7px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
        .reports-hero h1 { margin: 18px 0 10px; font-size: clamp(34px, 5vw, 52px); letter-spacing: -1.5px; }
        .reports-hero p { margin: 0; color: #aab4c5; font-size: 15px; line-height: 1.6; }
        .reports-content { width: 86%; max-width: 1300px; margin: -25px auto 35px; position: relative; }
        .reports-panel { background: #fff; border: 1px solid #e4e7ec; border-radius: 18px; padding: 25px; box-shadow: 0 8px 30px rgba(16,24,40,.06); }
        .reports-panel-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; }
        .reports-panel-header h2 { margin: 0; font-size: 21px; }
        .reports-panel-header p { margin: 6px 0 0; color: #667085; font-size: 13px; }
        .reports-refresh { border: 0; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; border-radius: 10px; padding: 12px 16px; background: #eef2f6; color: #344054; white-space: nowrap; }
        .reports-refresh:disabled { opacity: .6; cursor: wait; }
        .reports-message { padding: 24px; border-radius: 12px; background: #f8fafc; color: #667085; text-align: center; font-size: 14px; line-height: 1.6; }
        .reports-error { background: #fff1f2; color: #be123c; }
        .reports-list { display: grid; gap: 14px; }
        .report-card { border: 1px solid #e4e7ec; border-radius: 13px; padding: 18px; background: white; }
        .report-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 15px; }
        .report-title-block h3 { margin: 0; font-size: 15px; overflow-wrap: anywhere; }
        .report-title-block p { margin: 5px 0 0; color: #667085; font-size: 12px; }
        .report-count { flex-shrink: 0; background: #e0f2fe; color: #0369a1; border-radius: 20px; padding: 6px 9px; font-size: 11px; font-weight: 700; }
        .report-coordinates { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .report-coordinates div { background: #f8fafc; border: 1px solid #eaecf0; border-radius: 10px; padding: 12px; min-width: 0; }
        .report-coordinates span { display: block; color: #667085; font-size: 10px; letter-spacing: .8px; margin-bottom: 5px; }
        .report-coordinates strong { font-size: 13px; overflow-wrap: anywhere; }
        .report-detections { display: grid; gap: 8px; }
        .report-detection-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 11px 13px; border: 1px solid #eaecf0; border-radius: 9px; font-size: 13px; }
        .report-detection-row span { text-transform: capitalize; }
        .report-detection-row strong { color: #0284c7; white-space: nowrap; }
        .no-detections { margin: 0; color: #667085; font-size: 13px; }
        .reports-footer { width: 86%; max-width: 1300px; margin: 35px auto; padding: 25px 0; border-top: 1px solid #e4e7ec; display: flex; justify-content: space-between; gap: 10px; color: #667085; font-size: 12px; }
        @media (max-width: 700px) { .reports-content, .reports-footer { width: 92%; } .reports-hero { padding: 40px 5% 55px; } .reports-panel { padding: 18px; } .reports-panel-header { align-items: flex-start; flex-direction: column; } .reports-refresh { width: 100%; } .report-coordinates { grid-template-columns: 1fr; } .reports-footer { flex-direction: column; } }
      `}</style>
    </div>
  );
}

export default Reports;
