import { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setResult(null);
    setError("");
  }

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await client.post("/analyzer/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Couldn't analyze this resume — try again."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function scoreColor(score) {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#d97706";
    return "#dc2626";
  }

  return (
    <div>
      <Link to="/" className="btn-ghost" style={{ display: "inline-block", marginBottom: 12 }}>
        ← Back
      </Link>
      <h2>Resume Analyzer</h2>
      <p>Upload your resume as a PDF — AI will score it and suggest specific improvements.</p>

      <div className="card">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ marginBottom: 12 }}
        />
        <button className="btn-primary" onClick={handleAnalyze} disabled={!file || analyzing}>
          {analyzing ? <span className="btn-spinner" /> : "Analyze Resume"}
        </button>
        {error && <p className="error-banner" style={{ marginTop: 12 }}>{error}</p>}
      </div>

      {result && (
        <div style={{ marginTop: 24 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>Overall Score</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: scoreColor(result.score) }}>
              {result.score}
              <span style={{ fontSize: 20, color: "#9ca3af" }}>/100</span>
            </div>
            <p style={{ marginTop: 8 }}>{result.summary}</p>
          </div>

          <div className="card">
            <h3>✅ Strengths</h3>
            <ul style={{ listStyle: "disc", paddingLeft: 20, background: "none", boxShadow: "none" }}>
              {result.strengths.map((s, i) => (
                <li key={i} style={{ background: "none", boxShadow: "none", padding: "2px 0", display: "list-item" }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>🔧 Suggested Improvements</h3>
            <ul style={{ listStyle: "disc", paddingLeft: 20, background: "none", boxShadow: "none" }}>
              {result.improvements.map((imp, i) => (
                <li key={i} style={{ background: "none", boxShadow: "none", padding: "2px 0", display: "list-item" }}>
                  {imp}
                </li>
              ))}
            </ul>
          </div>

          {result.section_feedback.length > 0 && (
            <div className="card">
              <h3>Section-by-Section Feedback</h3>
              {result.section_feedback.map((sf, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong>{sf.section}</strong>
                  <p style={{ margin: "2px 0 0" }}>{sf.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}