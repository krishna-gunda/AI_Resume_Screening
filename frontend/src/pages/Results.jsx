import { useState } from "react";
import { ArrowLeft, Copy, Download, Check } from "lucide-react";
import jsPDF from "jspdf";

import MatchedSkillsCard from "../components/MatchedSkillsCard.jsx";
import MissingSkillsCard from "../components/MissingSkillsCard.jsx";
import MatchPercentCard from "../components/MatchPercentCard.jsx";
import VerdictCard from "../components/VerdictCard.jsx";
import ReasonsCard from "../components/ReasonsCard.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";

/**
 * Results page: shows the full analysis output plus bonus actions
 * (copy result, download as PDF, start a new analysis).
 */
export default function Results({ result, history, onReset }) {
  const [copied, setCopied] = useState(false);

  const {
    matchedSkills = [],
    missingSkills = [],
    matchPercentage = 0,
    verdict = "Not Yet",
    reasons = [],
    resumeFileName,
  } = result;

  const buildSummaryText = () =>
    [
      `AI Resume Screener Result`,
      `Resume: ${resumeFileName || "N/A"}`,
      ``,
      `Match Percentage: ${matchPercentage}%`,
      `Verdict: ${verdict}`,
      ``,
      `Matched Skills: ${matchedSkills.join(", ") || "None"}`,
      `Missing Skills: ${missingSkills.join(", ") || "None"}`,
      ``,
      `Reasons:`,
      ...reasons.map((r, i) => `${i + 1}. ${r}`),
    ].join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail in insecure contexts; fail silently in UI.
      setCopied(false);
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(buildSummaryText(), 180);
    doc.setFontSize(12);
    doc.text(lines, 15, 20);
    doc.save(`resume-screening-result-${Date.now()}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400"
        >
          <ArrowLeft size={16} />
          New Analysis
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Result"}
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 transition-colors"
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <MatchedSkillsCard skills={matchedSkills} />
        <MissingSkillsCard skills={missingSkills} />
        <MatchPercentCard percentage={matchPercentage} />
        <VerdictCard verdict={verdict} />
        <ReasonsCard reasons={reasons} />
      </div>

      {history?.length > 0 && (
        <div className="mt-5">
          <HistoryPanel history={history} />
        </div>
      )}
    </div>
  );
}
