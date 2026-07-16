import { History } from "lucide-react";

function formatTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return "";
  }
}

const VERDICT_DOT = {
  Qualified: "bg-emerald-500",
  "Almost There": "bg-orange-500",
  "Not Yet": "bg-red-500",
};

/**
 * HistoryPanel
 * ------------
 * Shows the last 5 analyses performed in this session (bonus feature).
 */
export default function HistoryPanel({ history = [] }) {
  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <History className="text-brand-500" size={18} />
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Recent Analyses
        </h3>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {history.map((item, idx) => (
          <li
            key={idx}
            className="py-2.5 flex items-center justify-between gap-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-700 dark:text-slate-200">
                {item.resumeFileName || "Resume"}
              </p>
              <p className="text-xs text-slate-400">{formatTime(item.timestamp)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {item.matchPercentage}%
              </span>
              <span
                className={`h-2 w-2 rounded-full ${
                  VERDICT_DOT[item.verdict] || "bg-slate-400"
                }`}
                title={item.verdict}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
