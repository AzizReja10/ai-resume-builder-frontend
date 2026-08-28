import { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

function ScoreRing({ score }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;
  const tone = score >= 80 ? "good" : score >= 60 ? "mid" : "low";

  return (
    <div className={`score-ring score-ring--${tone}`}>
      <svg viewBox="0 0 132 132" aria-hidden>
        <circle className="score-ring-track" cx="66" cy="66" r={radius} />
        <circle
          className="score-ring-value"
          cx="66"
          cy="66"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring-label">
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function setSelectedFile(nextFile) {
    if (!nextFile) return;
    setFile(nextFile);
    setResult(null);
    setError("");
  }

  function handleFileChange(e) {
    setSelectedFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === "application/pdf") {
      setSelectedFile(dropped);
    } else {
      setError("Please drop a PDF resume.");
    }
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

  return (
    <div className="analyzer-page">
      <Link to="/" className="back-link">
        ← Dashboard
      </Link>

      <div className="page-hero">
        <p className="eyebrow">AI review</p>
        <h2>Resume analyzer</h2>
        <p>
          Upload a PDF. You’ll get an overall score, what’s working, and concrete
          edits — section by section.
        </p>
      </div>

      <div className="analyzer-upload card">
        <label
          className={`dropzone ${dragOver ? "is-dragover" : ""} ${file ? "has-file" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <span className="dropzone-icon" aria-hidden>
            {file ? "✓" : "↑"}
          </span>
          <span className="dropzone-title">
            {file ? file.name : "Drop your PDF here"}
          </span>
          <span className="dropzone-hint">
            {file ? "Click to choose a different file" : "or click to browse — PDF only"}
          </span>
        </label>

        <button
          className="btn-primary analyzer-submit"
          onClick={handleAnalyze}
          disabled={!file || analyzing}
        >
          {analyzing ? <span className="btn-spinner" /> : "Analyze resume"}
        </button>
        {error && <p className="error-banner">{error}</p>}
      </div>

      {analyzing && (
        <p className="analyzing-hint">Reading your resume and drafting feedback…</p>
      )}

      {result && (
        <div className="analyzer-results">
          <div className="card score-card">
            <ScoreRing score={result.score} />
            <div className="score-copy">
              <p className="eyebrow">Overall score</p>
              <p className="score-summary">{result.summary}</p>
            </div>
          </div>

          <div className="insight-grid">
            <div className="card insight-card insight-card--good">
              <h3>Strengths</h3>
              <ul className="insight-list">
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="card insight-card insight-card--improve">
              <h3>Suggested improvements</h3>
              <ul className="insight-list">
                {result.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {result.section_feedback.length > 0 && (
            <div className="card section-feedback">
              <h3>Section-by-section</h3>
              <div className="section-feedback-list">
                {result.section_feedback.map((sf, i) => (
                  <div key={i} className="section-feedback-item">
                    <strong>{sf.section}</strong>
                    <p>{sf.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
