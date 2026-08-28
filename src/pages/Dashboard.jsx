import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const res = await client.get("/resumes/");
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await client.post("/resumes/", { title: newTitle });
    setResumes([...resumes, res.data]);
    setNewTitle("");
  }

  async function handleDelete(resumeId, title) {
    const confirmed = window.confirm(`Delete "${title}"? This can't be undone.`);
    if (!confirmed) return;
    try {
      await client.delete(`/resumes/${resumeId}`);
      setResumes(resumes.filter((r) => r.id !== resumeId));
    } catch (err) {
      console.error(err);
      alert("Couldn't delete resume — try again.");
    }
  }

  if (loading) return <p className="loading-text">Loading your workspace…</p>;

  return (
    <div className="dashboard-page">
      <div className="page-hero">
        <p className="eyebrow">Workspace</p>
        <h2>Your resumes</h2>
        <p>
          Draft, refine, and export — or drop in an existing PDF and let AI score
          it.
        </p>
      </div>

      <Link to="/analyzer" className="feature-banner">
        <span className="feature-banner-icon" aria-hidden>
          ✦
        </span>
        <span className="feature-banner-copy">
          <strong>Analyze an existing resume</strong>
          <span>Upload a PDF for a score, strengths, and specific edits.</span>
        </span>
        <span className="feature-banner-arrow" aria-hidden>
          →
        </span>
      </Link>

      <form onSubmit={handleCreate} className="create-bar">
        <input
          type="text"
          placeholder="Name this resume — e.g. Product designer 2026"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button className="btn-primary" type="submit">
          Create
        </button>
      </form>

      <p className="fine-print">
        Saved in this browser — no account needed. Clearing site data removes
        access.
      </p>

      {resumes.length === 0 ? (
        <div className="empty-state">
          <p>No resumes yet. Create one above, or analyze a PDF to get started.</p>
        </div>
      ) : (
        <ul className="resume-list">
          {resumes.map((r) => (
            <li key={r.id} className="resume-card">
              <div className="resume-card-meta">
                <span className="resume-card-mark" aria-hidden>
                  📄
                </span>
                <span className="resume-card-title">{r.title}</span>
              </div>
              <div className="resume-card-actions">
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/resumes/${r.id}`)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(r.id, r.title)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
