import axios from "axios";

function getOrCreateSessionId() {
  let sessionId = localStorage.getItem("resume_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("resume_session_id", sessionId);
  }
  return sessionId;
}

const client = axios.create({
  baseURL: "https://ai-resume-builder-backend-m3v3.onrender.com",
  headers: {
    "X-Session-Id": getOrCreateSessionId(),
  },
});

export default client;