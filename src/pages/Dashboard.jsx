import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>Your Resumes</h2>
      </div>
      <p style={{ marginTop: -8, marginBottom: 16, fontSize: 13 }}>
        Your resumes are saved to this browser — no account needed. Clearing your browser data will lose access to them.
      </p>

      <form
        onSubmit={handleCreate}
        style={{ maxWidth: "none", margin: "20px 0", flexDirection: "row" }}
      >
        <input
          type="text"
          placeholder="New resume title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button className="btn-primary" type="submit">
          Create
        </button>
      </form>

      <ul>
        {resumes.map((r) => (
          <li key={r.id}>
            <span>{r.title}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" onClick={() => navigate(`/resumes/${r.id}`)}>
                Edit
              </button>
              <button className="btn-danger" onClick={() => handleDelete(r.id, r.title)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}