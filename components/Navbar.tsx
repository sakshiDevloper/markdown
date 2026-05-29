"use client";

import { FiGithub, FiTwitter } from "react-icons/fi";
import { SiMarkdown } from "react-icons/si";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect, useRef } from "react";

// Sticky modern navbar with theme toggle and social links
export default function Navbar({ recentFiles: propRecentFiles, activeFileName, onSelectFile }: { 
  recentFiles?: Array<{ id: string; name: string; timestamp: number }>;
  activeFileName?: string;
  onSelectFile?: (id: string) => void;
}) {
  const [recentFiles, setRecentFiles] = useState<Array<{ id: string; name: string; timestamp: number }>>([]);
  const [showRecent, setShowRecent] = useState(false);
  const recentRef = useRef<HTMLDivElement>(null);

  // Sync from props (live updates) or fallback to localStorage
  useEffect(() => {
    if (propRecentFiles) {
      setRecentFiles(propRecentFiles);
    } else {
      try {
        const stored = localStorage.getItem("markdown-converter-recent");
        if (stored) {
          setRecentFiles(JSON.parse(stored));
        }
      } catch {}
    }
  }, [propRecentFiles]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (recentRef.current && !recentRef.current.contains(e.target as Node)) {
        setShowRecent(false);
      }
    };
    if (showRecent) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [showRecent]);

  return (
    <nav className="sticky top-2 z-40 border border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80 mx-4 rounded-lg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white shadow-lg">
              <SiMarkdown className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
                Markdown
              </h1>
              <p className="text-[10px] leading-none text-zinc-500 dark:text-zinc-400">
                Convert
              </p>
            </div>
          </div>

          {/* Current file name */}
          {activeFileName && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-40">
                {activeFileName}
              </span>
            </div>
          )}

          {/* Recent Files Dropdown */}
          {recentFiles.length > 0 && (
            <div className="relative" ref={recentRef}>
              <button
                onClick={() => setShowRecent(!showRecent)}
                className="hidden md:flex text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                title="Recent files"
              >
                📋 Recent
              </button>
              {showRecent && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg dark:shadow-black/30 z-50">
                  <div className="py-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                    Recently opened
                  </div>
                  <div className="p-1.5 max-h-64 overflow-y-auto">
                    {recentFiles.map((file, idx) => (
                      <button
                        key={file.id}
                        onClick={() => { onSelectFile?.(file.id); setShowRecent(false); }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title={file.name}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-100 text-[10px] font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                          {idx + 1}
                        </span>
                        <span className="truncate">{file.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right side: theme toggle and social links */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white/50 text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <FiGithub className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white/50 text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <FiTwitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}