import { useCallback, useState } from "react";
import { analyzeResume } from "../services/api";

/**
 * useAnalyze
 * ----------
 * Encapsulates the loading / error / result state machine for a
 * single "analyze resume" request, so <App /> stays declarative.
 */
export function useAnalyze() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const runAnalysis = useCallback(async (resumeFile, jobDescription) => {
    setError(null);

    if (!resumeFile) {
      setError("Please upload your resume as a PDF before analyzing.");
      return;
    }
    if (resumeFile.type !== "application/pdf") {
      setError("Only PDF files are supported for the resume.");
      return;
    }
    if (!jobDescription || !jobDescription.trim()) {
      setError("Please paste a job description before analyzing.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await analyzeResume(resumeFile, jobDescription);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { isLoading, error, result, runAnalysis, reset };
}
