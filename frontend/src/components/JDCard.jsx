import { ClipboardList } from "lucide-react";

/**
 * JDCard
 * ------
 * Textarea for pasting the job description, with a live character count.
 */
export default function JDCard({ value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 grid place-items-center">
          <ClipboardList size={16} />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Paste Job Description
        </h3>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the full job description here (required skills, responsibilities, etc.)..."
        className="flex-1 min-h-[220px] w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />

      <p className="mt-2 text-xs text-slate-400 text-right">
        {value?.length ?? 0} characters
      </p>
    </div>
  );
}
