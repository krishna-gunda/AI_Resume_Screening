import { Loader2 } from "lucide-react";

export default function Loader({ label = "Analyzing your resume..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 animate-fade-in">
      <Loader2 className="text-brand-600 animate-spin-slow" size={40} />
      <p className="text-slate-600 dark:text-slate-300 font-medium">{label}</p>
      <p className="text-xs text-slate-400">This usually takes a few seconds...</p>
    </div>
  );
}
