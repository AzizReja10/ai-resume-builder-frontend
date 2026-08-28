import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import ResumeEditor from "./pages/ResumeEditor";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analyzer" element={<ResumeAnalyzer />} />
        <Route path="/resumes/:id" element={<ResumeEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;