import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

const VERDICT_STYLES = {
  Qualified: {
    icon: CheckCircle,
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  "Almost There": {
    icon: HelpCircle,
    badge:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    dot: "bg-orange-500",
  },
  "Not Yet": {
    icon: AlertTriangle,
    badge:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    dot: "bg-red-500",
  },
};

export default function VerdictCard({ verdict = "Not Yet" }) {
  const style = VERDICT_STYLES[verdict] || VERDICT_STYLES["Not Yet"];
  const Icon = style.icon;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col items-center justify-center gap-3 animate-fade-in">
      <h3 className="font-semibold text-slate-900 dark:text-white self-start">Verdict</h3>
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold ${style.badge}`}
      >
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        <Icon size={18} />
        {verdict}
      </div>
    </div>
  );
}
