import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

/**
 * UploadCard
 * ----------
 * Handles resume PDF selection via click-to-browse OR drag-and-drop.
 */
export default function UploadCard({ file, onFileChange }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList) => {
    const selected = fileList?.[0];
    if (selected) onFileChange(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 grid place-items-center">
          <UploadCloud size={16} />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white">Upload Resume</h3>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        className={`flex-1 rounded-xl border-2 border-dashed grid place-items-center text-center p-6 cursor-pointer transition-colors ${
          isDragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
            : "border-slate-300 dark:border-slate-700 hover:border-brand-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileText className="text-brand-600 dark:text-brand-400" size={32} />
            <p className="font-medium text-slate-800 dark:text-slate-100 break-all px-2">
              {file.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {(file.size / 1024).toFixed(0)} KB
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
            >
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
            <UploadCloud size={32} />
            <p className="text-sm font-medium">Drag &amp; drop your PDF resume here</p>
            <p className="text-xs">or click to browse (max 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}
