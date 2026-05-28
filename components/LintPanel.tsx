"use client";

import { useMemo, useState } from "react";
import { FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from "react-icons/fi";
import { lintMarkdown, type LintWarning } from "@/lib/linter";

interface LintPanelProps {
  markdown: string;
  onClose: () => void;
}

export default function LintPanel({ markdown, onClose }: LintPanelProps) {
  const [showAll, setShowAll] = useState(false);

  const warnings = useMemo(() => lintMarkdown(markdown), [markdown]);

  const displayed = showAll ? warnings : warnings.slice(0, 10);

  const errorCount = warnings.filter((w) => w.severity === "error").length;
  const warningCount = warnings.filter((w) => w.severity === "warning").length;
  const infoCount = warnings.filter((w) => w.severity === "info").length;

  if (warnings.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900/30 dark:bg-emerald-900/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            ✅ No lint issues found
          </span>
          <button
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          >
            <FiX className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <div className="flex items-center gap-2 text-xs font-medium">
          {errorCount > 0 && <span className="text-red-600 dark:text-red-400">{errorCount} errors</span>}
          {warningCount > 0 && <span className="text-amber-600 dark:text-amber-400">{warningCount} warnings</span>}
          {infoCount > 0 && <span className="text-blue-600 dark:text-blue-400">{infoCount} info</span>}
        </div>
        <button
          onClick={onClose}
          className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <FiX className="h-3 w-3" />
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto p-2">
        {displayed.map((w, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded px-2 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            {w.severity === "error" && <FiAlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />}
            {w.severity === "warning" && <FiAlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />}
            {w.severity === "info" && <FiInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />}
            <span className="text-zinc-700 dark:text-zinc-300">
              <span className="font-mono text-zinc-500">L{w.line}:</span> {w.message}
            </span>
          </div>
        ))}
        {!showAll && warnings.length > 10 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-1 text-center text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Show all {warnings.length} issues
          </button>
        )}
      </div>
    </div>
  );
}