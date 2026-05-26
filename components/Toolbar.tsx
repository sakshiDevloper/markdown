"use client";

import { useState } from "react";
import { FiCopy, FiDownload, FiRotateCcw, FiTrash2 } from "react-icons/fi";

interface ToolbarProps {
  html: string;
  onReset: () => void;
  onClear: () => void;
}

// Toolbar with action buttons: reset, clear, copy, and download
export default function Toolbar({ html, onReset, onClear }: ToolbarProps) {
  // State for copy feedback
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Copy HTML to clipboard with visual feedback
  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    }
  };

  // Download HTML as a file
  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Reset button - loads sample markdown */}
      <button
        onClick={onReset}
        title="Reset to sample markdown"
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <FiRotateCcw className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Reset</span>
      </button>

      {/* Divider */}
      <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Clear button - clears all markdown */}
      <button
        onClick={onClear}
        title="Clear editor"
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
      >
        <FiTrash2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Clear</span>
      </button>

      {/* Divider */}
      <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Copy button - copies HTML with feedback */}
      <button
        onClick={copyHtml}
        title="Copy HTML to clipboard"
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
          copyFeedback
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        <FiCopy className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {copyFeedback ? "Copied!" : "Copy"}
        </span>
      </button>

      {/* Download button - exports HTML as file */}
      <button
        onClick={downloadHtml}
        title="Download HTML file"
        className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-md shadow-indigo-600/30 transition-all duration-200 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40"
      >
        <FiDownload className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Download</span>
      </button>
    </div>
  );
}