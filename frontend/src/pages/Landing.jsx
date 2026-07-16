import { Sparkles } from "lucide-react";
import UploadCard from "../components/UploadCard.jsx";
import JDCard from "../components/JDCard.jsx";
import Loader from "../components/Loader.jsx";

/**
 * Landing page: title, upload + JD cards, analyze button.
 */
export default function Landing({
  file,
  onFileChange,
  jobDescription,
  onJobDescriptionChange,
  onAnalyze,
  isLoading,
  error,
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium px-3 py-1 mb-4">
          <Sparkles size={12} />
          Powered by OpenAI
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          AI Resume Screener
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Upload a resume, paste a job description, and instantly see the skill
          gap, match percentage, and a hiring verdict.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <UploadCard file={file} onFileChange={onFileChange} />
        <JDCard value={jobDescription} onChange={onJobDescriptionChange} />
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 animate-fade-in">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 shadow-sm transition-colors"
        >
          <Sparkles size={18} />
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {isLoading && <Loader />}
    </div>
  );
}
