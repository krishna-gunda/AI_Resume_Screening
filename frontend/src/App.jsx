import { useEffect, useState } from "react";

import Navbar from "./components/Navbar.jsx";
import Landing from "./pages/Landing.jsx";
import Results from "./pages/Results.jsx";

import { useDarkMode } from "./hooks/useDarkMode.js";
import { useAnalyze } from "./hooks/useAnalyze.js";
import { fetchHistory } from "./services/api.js";

export default function App() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { isLoading, error, result, runAnalysis, reset } = useAnalyze();

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [history, setHistory] = useState([]);

  // Load session history on first mount (bonus feature).
  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    await runAnalysis(file, jobDescription);
  };

  // Refresh history whenever a new result comes back.
  useEffect(() => {
    if (result) {
      fetchHistory().then(setHistory).catch(() => {});
    }
  }, [result]);

  const handleReset = () => {
    reset();
    setFile(null);
    setJobDescription("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isDark={isDark} onToggleDarkMode={toggleDarkMode} />

      <main className="flex-1">
        {result ? (
          <Results result={result} history={history} onReset={handleReset} />
        ) : (
          <Landing
            file={file}
            onFileChange={setFile}
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
          />
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        Built with Flask, React, Tailwind &amp; OpenAI.
      </footer>
    </div>
  );
}
