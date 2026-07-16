import { ListChecks } from "lucide-react";

export default function ReasonsCard({ reasons = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm animate-fade-in md:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks className="text-brand-500" size={20} />
        <h3 className="font-semibold text-slate-900 dark:text-white">Why this verdict?</h3>
      </div>
      <ol className="space-y-2">
        {reasons.map((reason, idx) => (
          <li
            key={idx}
            className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200"
          >
            <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-bold grid place-items-center">
              {idx + 1}
            </span>
            {reason}
          </li>
        ))}
      </ol>
    </div>
  );
}
