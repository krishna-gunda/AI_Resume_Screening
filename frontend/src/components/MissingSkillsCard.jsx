import { XCircle } from "lucide-react";
import SkillChip from "./SkillChip.jsx";

export default function MissingSkillsCard({ skills = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <XCircle className="text-red-500" size={20} />
        <h3 className="font-semibold text-slate-900 dark:text-white">Missing Skills</h3>
        <span className="ml-auto text-xs font-medium text-slate-400">
          {skills.length}
        </span>
      </div>
      {skills.length === 0 ? (
        <p className="text-sm text-slate-400">No missing skills — great match!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillChip key={skill} label={skill} variant="missing" />
          ))}
        </div>
      )}
    </div>
  );
}
