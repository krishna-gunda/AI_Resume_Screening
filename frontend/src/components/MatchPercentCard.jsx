import { useEffect, useState } from "react";
import { Gauge } from "lucide-react";

/**
 * MatchPercentCard
 * ----------------
 * Displays the match percentage as an animated SVG circular progress ring.
 * The ring color adapts to the score (red -> orange -> green).
 */
export default function MatchPercentCard({ percentage = 0 }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 900; // ms
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(eased * percentage));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [percentage]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  const colorClass =
    percentage >= 75
      ? "text-emerald-500"
      : percentage >= 40
      ? "text-orange-500"
      : "text-red-500";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col items-center justify-center animate-fade-in">
      <div className="flex items-center gap-2 self-start mb-2">
        <Gauge className="text-brand-500" size={20} />
        <h3 className="font-semibold text-slate-900 dark:text-white">Match %</h3>
      </div>

      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            className="stroke-slate-100 dark:stroke-slate-800"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${colorClass} transition-[stroke-dashoffset] duration-200 ease-out`}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className={`text-3xl font-bold ${colorClass}`}>{animatedValue}%</span>
        </div>
      </div>
    </div>
  );
}
