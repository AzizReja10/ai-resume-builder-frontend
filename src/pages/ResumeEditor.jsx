import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
export default function ResumeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, initializing } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [skillsSyncUrl, setSkillsSyncUrl] = useState("");
  const [syncingSkills, setSyncingSkills] = useState(false);
  const [skillsSyncError, setSkillsSyncError] = useState("");

   useEffect(() => {
    if (initializing) return;
    if (!token) {
      navigate("/login");
      return;
    }
    fetchResume();
  }, [id, token, initializing]);

  async function fetchResume() {
    try {
      const res = await client.get(`/resumes/${id}`);
      setResume(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await client.patch(`/resumes/${id}`, {
        personal_info: resume.personal_info,
        education: resume.education,
        experience: resume.experience,
        projects: resume.projects,
        skills: resume.skills,
        extracurricular: resume.extracurricular,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleExportPdf() {
    const res = await client.get(`/resumes/${id}/export-pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${resume.title.replace(/\s+/g, "_")}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // ---------- Personal Info ----------
  function updatePersonalInfo(field, value) {
    setResume({
      ...resume,
      personal_info: { ...resume.personal_info, [field]: value },
    });
  }

  function addLink() {
    const links = resume.personal_info?.links || [];
    setResume({
      ...resume,
      personal_info: {
        ...resume.personal_info,
        links: [...links, { label: "", url: "" }],
      },
    });
  }

  function updateLink(index, field, value) {
    const links = [...(resume.personal_info?.links || [])];
    links[index] = { ...links[index], [field]: value };
    setResume({
      ...resume,
      personal_info: { ...resume.personal_info, links },
    });
  }

  function removeLink(index) {
    const links = (resume.personal_info?.links || []).filter((_, i) => i !== index);
    setResume({
      ...resume,
      personal_info: { ...resume.personal_info, links },
    });
  }

  // ---------- Projects ----------
  function addProject() {
    setResume({
      ...resume,
      projects: [
        ...resume.projects,
        { name: "", tags: "", date: "", live_url: "", bullets: [] },
      ],
    });
  }

  async function generateProjectFromGithub() {
    if (!githubUrl.trim()) return;
    setGenerating(true);
    setGenerateError("");
    try {
      const res = await client.post(`/resumes/${id}/generate-project-from-github`, {
        github_url: githubUrl.trim(),
      });
      const generated = res.data;

      const mergedSkills = mergeSkills(resume.skills, generated.skills || []);
      const mergedLinks = mergeLinks(resume.personal_info?.links || [], generated.profile_links || []);
      const mergedEducation = mergeEducation(resume.education, generated.education || []);

      setResume({
        ...resume,
        projects: [
          ...resume.projects,
          {
            name: generated.name,
            tags: generated.tags,
            date: "",
            live_url: githubUrl.trim(),
            bullets: generated.bullets,
          },
        ],
        skills: mergedSkills,
        personal_info: { ...resume.personal_info, links: mergedLinks },
        education: mergedEducation,
      });
      setGithubUrl("");
    } catch (err) {
      console.error(err);
      setGenerateError(
        err.response?.data?.detail || "Couldn't generate a project from that repo — check the URL is a public GitHub repo."
      );
    } finally {
      setGenerating(false);
    }
  }

  function mergeSkills(existing, incoming) {
    const merged = existing.map((group) => ({
      category: group.category,
      items: [...group.items],
    }));

    for (const incomingGroup of incoming) {
      const match = merged.find(
        (g) => g.category.toLowerCase() === incomingGroup.category.toLowerCase()
      );
      if (match) {
        for (const item of incomingGroup.items) {
          if (!match.items.some((existingItem) => existingItem.toLowerCase() === item.toLowerCase())) {
            match.items.push(item);
          }
        }
      } else {
        merged.push({ category: incomingGroup.category, items: [...incomingGroup.items] });
      }
    }

    return merged;
  }

  function mergeLinks(existing, incoming) {
    const merged = [...existing];
    for (const link of incoming) {
      const alreadyExists = merged.some(
        (l) => l.url.trim().toLowerCase() === link.url.trim().toLowerCase()
      );
      if (!alreadyExists && link.url) {
        merged.push({ label: link.label, url: link.url });
      }
    }
    return merged;
  }

  function mergeEducation(existing, incoming) {
    const merged = [...existing];
    for (const edu of incoming) {
      const alreadyExists = merged.some(
        (e) => e.institution.trim().toLowerCase() === edu.institution.trim().toLowerCase()
      );
      if (!alreadyExists && edu.institution) {
        merged.push({
          institution: edu.institution,
          degree: edu.degree || "",
          detail: edu.detail || "",
          dates: edu.dates || "",
        });
      }
    }
    return merged;
  }

  function updateProject(index, field, value) {
    const updated = [...resume.projects];
    updated[index] = { ...updated[index], [field]: value };
    setResume({ ...resume, projects: updated });
  }

  function removeProject(index) {
    setResume({
      ...resume,
      projects: resume.projects.filter((_, i) => i !== index),
    });
  }

  function addBullet(projectIndex) {
    const updated = [...resume.projects];
    updated[projectIndex] = {
      ...updated[projectIndex],
      bullets: [...updated[projectIndex].bullets, ""],
    };
    setResume({ ...resume, projects: updated });
  }

  function updateBullet(projectIndex, bulletIndex, value) {
    const updated = [...resume.projects];
    const bullets = [...updated[projectIndex].bullets];
    bullets[bulletIndex] = value;
    updated[projectIndex] = { ...updated[projectIndex], bullets };
    setResume({ ...resume, projects: updated });
  }

  function removeBullet(projectIndex, bulletIndex) {
    const updated = [...resume.projects];
    updated[projectIndex] = {
      ...updated[projectIndex],
      bullets: updated[projectIndex].bullets.filter((_, i) => i !== bulletIndex),
    };
    setResume({ ...resume, projects: updated });
  }

  async function optimizeBullet(projectIndex, bulletIndex) {
    const rawBullet = resume.projects[projectIndex].bullets[bulletIndex];
    if (!rawBullet.trim()) return;
    try {
      const res = await client.post(`/resumes/${id}/optimize-bullet`, {
        raw_bullet: rawBullet,
      });
      console.log("DEBUG projectIndex:", projectIndex, "bulletIndex:", bulletIndex);
      console.log("DEBUG rawBullet sent:", rawBullet);
      console.log("DEBUG rewritten received:", res.data.rewritten);
      updateBullet(projectIndex, bulletIndex, res.data.rewritten);
    } catch (err) {
      console.error(err);
      alert("AI optimization failed — try again.");
    }
  }

  // ---------- Education ----------
  function addEducation() {
    setResume({
      ...resume,
      education: [
        ...resume.education,
        { institution: "", degree: "", detail: "", dates: "" },
      ],
    });
  }

  function updateEducation(index, field, value) {
    const updated = [...resume.education];
    updated[index] = { ...updated[index], [field]: value };
    setResume({ ...resume, education: updated });
  }

  function removeEducation(index) {
    setResume({
      ...resume,
      education: resume.education.filter((_, i) => i !== index),
    });
  }

  // ---------- Skills ----------
  async function syncSkillsFromGithub() {
    if (!skillsSyncUrl.trim()) return;
    setSyncingSkills(true);
    setSkillsSyncError("");
    try {
      const res = await client.post(`/resumes/${id}/sync-skills-from-github-profile`, {
        github_url: skillsSyncUrl.trim(),
      });
      const merged = mergeSkills(resume.skills, res.data.skills || []);
      setResume({ ...resume, skills: merged });
    } catch (err) {
      console.error(err);
      setSkillsSyncError(
        err.response?.data?.detail || "Couldn't sync skills — check the GitHub profile URL."
      );
    } finally {
      setSyncingSkills(false);
    }
  }

  function addSkillGroup() {
    setResume({
      ...resume,
      skills: [...resume.skills, { category: "", items: [] }],
    });
  }

  function updateSkillCategory(index, value) {
    const updated = [...resume.skills];
    updated[index] = { ...updated[index], category: value };
    setResume({ ...resume, skills: updated });
  }

  function updateSkillItems(index, value) {
    const items = value.split(",").map((s) => s.trim()).filter(Boolean);
    const updated = [...resume.skills];
    updated[index] = { ...updated[index], items };
    setResume({ ...resume, skills: updated });
  }

  function removeSkillGroup(index) {
    setResume({
      ...resume,
      skills: resume.skills.filter((_, i) => i !== index),
    });
  }

  // ---------- Extracurricular ----------
  function addExtracurricular() {
    setResume({
      ...resume,
      extracurricular: [...resume.extracurricular, ""],
    });
  }

  function updateExtracurricular(index, value) {
    const updated = [...resume.extracurricular];
    updated[index] = value;
    setResume({ ...resume, extracurricular: updated });
  }

  function removeExtracurricular(index) {
    setResume({
      ...resume,
      extracurricular: resume.extracurricular.filter((_, i) => i !== index),
    });
  }

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!resume) return <p className="loading-text">Resume not found.</p>;

  return (
    <div>
      <button className="btn-ghost" onClick={() => navigate("/dashboard")}>
        ← Back
      </button>
      <h2>{resume.title}</h2>

      {/* Personal Info */}
      <section>
        <h3>Personal Info</h3>
        <div className="card">
          <input
            placeholder="Name"
            value={resume.personal_info?.name || ""}
            onChange={(e) => updatePersonalInfo("name", e.target.value)}
          />
          <input
            placeholder="Location"
            value={resume.personal_info?.location || ""}
            onChange={(e) => updatePersonalInfo("location", e.target.value)}
          />
          <input
            placeholder="Phone"
            value={resume.personal_info?.phone || ""}
            onChange={(e) => updatePersonalInfo("phone", e.target.value)}
          />
          <input
            placeholder="Email"
            value={resume.personal_info?.email || ""}
            onChange={(e) => updatePersonalInfo("email", e.target.value)}
          />

          <div style={{ marginTop: 12 }}>
            <strong style={{marginRight:14}}>Profile Links</strong>
            {(resume.personal_info?.links || []).map((link, index) => (
              <div key={index} className="bullet-row">
                <input
                  placeholder="Label (e.g. GitHub, LinkedIn, LeetCode)"
                  value={link.label}
                  onChange={(e) => updateLink(index, "label", e.target.value)}
                  style={{ maxWidth: 200 }}
                />
                <input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink(index, "url", e.target.value)}
                />
                <button className="btn-danger" onClick={() => removeLink(index)}>
                  ✕
                </button>
              </div>
            ))}
            <button className="btn-primary" onClick={addLink} style={{ marginTop: 8 }}>
              + Add Link
            </button>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="section-header">
          <h3>Projects</h3>
          <button className="btn-primary" onClick={addProject}>
            + Add Project
          </button>
        </div>

        <div className="card" style={{ background: "#f8f9fe" }}>
          <strong>✨ Generate from GitHub</strong>
          <p style={{ margin: "4px 0 8px", fontSize: 13 }}>
            Paste a public repo link — AI will fill in the name, tech tags, and bullets for you.
          </p>
          <div className="bullet-row">
            <input
              placeholder="https://github.com/username/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={generating}
            />
            <button className="btn-primary" onClick={generateProjectFromGithub} disabled={generating}>
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>
          {generateError && <p className="error-banner" style={{ marginTop: 8 }}>{generateError}</p>}
        </div>

        {resume.projects.map((project, pIndex) => (
          <div key={pIndex} className="card">
            <input
              placeholder="Project Name"
              value={project.name}
              onChange={(e) => updateProject(pIndex, "name", e.target.value)}
            />
            <input
              placeholder="Tags (e.g. React, Node.js)"
              value={project.tags}
              onChange={(e) => updateProject(pIndex, "tags", e.target.value)}
            />
            <input
              placeholder="Date (e.g. 2026)"
              value={project.date}
              onChange={(e) => updateProject(pIndex, "date", e.target.value)}
            />
            <input
              placeholder="Live/GitHub URL"
              value={project.live_url}
              onChange={(e) => updateProject(pIndex, "live_url", e.target.value)}
            />

            <div style={{ marginTop: 8 }}>
              <strong>Bullets</strong>
              {project.bullets.map((bullet, bIndex) => (
                <div key={bIndex} className="bullet-row">
                  <input
                    value={bullet}
                    onChange={(e) => updateBullet(pIndex, bIndex, e.target.value)}
                  />
                  <button className="btn-ghost" onClick={() => optimizeBullet(pIndex, bIndex)}>
                    ✨ Optimize
                  </button>
                  <button className="btn-danger" onClick={() => removeBullet(pIndex, bIndex)}>
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="btn-primary"
                onClick={() => addBullet(pIndex)}
                style={{ marginTop: 8 }}
              >
                + Add Bullet
              </button>
            </div>

            <button
              className="btn-danger"
              onClick={() => removeProject(pIndex)}
              style={{ marginTop: 12 }}
            >
              Remove Project
            </button>
          </div>
        ))}
      </section>

      {/* Education */}
      <section>
        <div className="section-header">
          <h3>Education</h3>
          <button className="btn-primary" onClick={addEducation}>
            + Add Education
          </button>
        </div>

        {resume.education.map((edu, index) => (
          <div key={index} className="card">
            <input
              placeholder="Institution"
              value={edu.institution}
              onChange={(e) => updateEducation(index, "institution", e.target.value)}
            />
            <input
              placeholder="Degree"
              value={edu.degree}
              onChange={(e) => updateEducation(index, "degree", e.target.value)}
            />
            <input
              placeholder="Detail (e.g. CGPA - 7.3)"
              value={edu.detail}
              onChange={(e) => updateEducation(index, "detail", e.target.value)}
            />
            <input
              placeholder="Dates (e.g. 2022 - 2026)"
              value={edu.dates}
              onChange={(e) => updateEducation(index, "dates", e.target.value)}
            />
            <button
              className="btn-danger"
              onClick={() => removeEducation(index)}
              style={{ marginTop: 8 }}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section>
        <div className="section-header">
          <h3>Skills</h3>
          <button className="btn-primary" onClick={addSkillGroup}>
            + Add Skill Group
          </button>
        </div>

        <div className="card" style={{ background: "#f8f9fe" }}>
          <strong>✨ Sync from GitHub Profile</strong>
          <p style={{ margin: "4px 0 8px", fontSize: 13 }}>
            Paste your GitHub profile URL — AI will detect languages across your public repos and add them here.
          </p>
          <div className="bullet-row">
            <input
              placeholder="https://github.com/username"
              value={skillsSyncUrl}
              onChange={(e) => setSkillsSyncUrl(e.target.value)}
              disabled={syncingSkills}
            />
            <button className="btn-primary" onClick={syncSkillsFromGithub} disabled={syncingSkills}>
              {syncingSkills ? "Syncing..." : "Sync"}
            </button>
          </div>
          {skillsSyncError && <p className="error-banner" style={{ marginTop: 8 }}>{skillsSyncError}</p>}
        </div>

        {resume.skills.map((group, index) => (
          <div key={index} className="card">
            <input
              placeholder="Category (e.g. Languages)"
              value={group.category}
              onChange={(e) => updateSkillCategory(index, e.target.value)}
            />
            <input
              placeholder="Items, comma-separated (e.g. Java, Python)"
              value={group.items.join(", ")}
              onChange={(e) => updateSkillItems(index, e.target.value)}
            />
            <button
              className="btn-danger"
              onClick={() => removeSkillGroup(index)}
              style={{ marginTop: 8 }}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* Extracurricular */}
      <section>
        <div className="section-header">
          <h3>Extracurricular</h3>
          <button className="btn-primary" onClick={addExtracurricular}>
            + Add Line
          </button>
        </div>

        {resume.extracurricular.map((line, index) => (
          <div key={index} className="bullet-row">
            <input
              value={line}
              onChange={(e) => updateExtracurricular(index, e.target.value)}
            />
            <button className="btn-danger" onClick={() => removeExtracurricular(index)}>
              ✕
            </button>
          </div>
        ))}
      </section>

      {/* Save / Export */}
      <div className="action-bar">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button className="btn-success" onClick={handleExportPdf}>
          Export PDF
        </button>
      </div>
    </div>
  );
}