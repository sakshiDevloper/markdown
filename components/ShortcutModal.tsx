"use client";

import { useEffect, useCallback } from "react";
import { FiX } from "react-icons/fi";

interface ShortcutModalProps {
  onClose: () => void;
}

const sections = [
  {
    title: "Editing",
    shortcuts: [
      { keys: "Ctrl+B", label: "Bold" },
      { keys: "Ctrl+I", label: "Italic" },
      { keys: "Ctrl+K", label: "Insert Link" },
      { keys: "Ctrl+`", label: "Inline Code" },
      { keys: "Ctrl+Shift+`", label: "Code Block" },
      { keys: "Ctrl+H / Ctrl+F", label: "Find & Replace" },
    ],
  },
  {
    title: "Formatting",
    shortcuts: [
      { keys: "Ctrl+Shift+S", label: "Strikethrough (via toolbar)" },
      { keys: "# + Space", label: "Heading" },
      { keys: "> + Space", label: "Blockquote" },
      { keys: "- + Space", label: "Bullet List" },
      { keys: "1. + Space", label: "Numbered List" },
    ],
  },
];

export default function ShortcutModal({ onClose }: ShortcutModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-lg animate-fadeIn rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            title="Close (Esc)"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 space-y-5 overflow-y-auto pr-1">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {shortcut.label}
                    </span>
                    <kbd className="rounded-md border border-zinc-300 bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-700 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
          Press <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-zinc-600 dark:bg-zinc-800">?</kbd> to open this panel
        </p>
      </div>
    </div>
  );
}
