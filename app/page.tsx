"use client";

import { useState, useCallback, useMemo } from "react";
import { marked } from "marked";
import Navbar from "@/components/Navbar";
import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import Toolbar from "@/components/Toolbar";
import Footer from "@/components/Footer";
import { sampleMarkdown } from "@/lib/sample";
import { FiEdit3, FiEye } from "react-icons/fi";

type FullscreenMode = "none" | "editor" | "preview";

export default function Home() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [fullscreen, setFullscreen] = useState<FullscreenMode>("none");

  const parsedHtml = useMemo(() => {
    if (!markdown.trim()) return "";
    try {
      return marked.parse(markdown) as string;
    } catch {
      return "";
    }
  }, [markdown]);

  const handleChange = useCallback((value: string) => {
    setMarkdown(value);
  }, []);

  const handleReset = useCallback(() => {
    setMarkdown(sampleMarkdown);
  }, []);

  const handleClear = useCallback(() => {
    setMarkdown("");
  }, []);

  // Determine layout class based on fullscreen state
  const isEditorFullscreen = fullscreen === "editor";
  const isPreviewFullscreen = fullscreen === "preview";

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />

      <main className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
        {/* Sticky toolbar bar */}
        <div className="sticky top-16 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-950/95">
          <div className="px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              {/* Mobile tab toggle */}
              <div className="flex gap-1 rounded-lg border border-zinc-300 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900 sm:hidden">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTab === "editor"
                      ? "bg-indigo-100 text-indigo-900 shadow-sm dark:bg-indigo-600/20 dark:text-indigo-100"
                      : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  <FiEdit3 className="h-3.5 w-3.5" />
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTab === "preview"
                      ? "bg-purple-100 text-purple-900 shadow-sm dark:bg-purple-600/20 dark:text-purple-100"
                      : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  <FiEye className="h-3.5 w-3.5" />
                  Preview
                </button>
              </div>

              {/* Desktop label */}
              <div className="hidden flex-1 sm:flex sm:items-center sm:gap-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Tools
                </span>
              </div>

              {/* Action buttons: reset, clear, copy, download */}
              <Toolbar
                html={parsedHtml}
                onReset={handleReset}
                onClear={handleClear}
              />
            </div>
          </div>
        </div>

        {/* Fullscreen single pane */}
        {isEditorFullscreen && (
          <div className="flex flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl gap-4">
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Editor (Fullscreen)
                  </span>
                  <button
                    onClick={() => setFullscreen("none")}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
                    Exit
                  </button>
                </div>
                <Editor
                  value={markdown}
                  onChange={handleChange}
                  fullscreen={true}
                  onToggleFullscreen={() => setFullscreen("none")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen single pane (preview) */}
        {isPreviewFullscreen && (
          <div className="flex flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl gap-4">
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Preview (Fullscreen)
                  </span>
                  <button
                    onClick={() => setFullscreen("none")}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
                    Exit
                  </button>
                </div>
                <Preview
                  markdown={markdown}
                  fullscreen={true}
                  onToggleFullscreen={() => setFullscreen("none")}
                />
              </div>
            </div>
          </div>
        )}

        {/* Split panes (hidden when fullscreen) */}
        {!isEditorFullscreen && !isPreviewFullscreen && (
          <div className="flex flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl gap-4">
              {/* Editor pane */}
              <div
                className={`flex-1 min-w-0 overflow-hidden ${
                  activeTab === "preview" ? "hidden sm:flex" : "flex"
                } flex-col`}
              >
                <Editor
                  value={markdown}
                  onChange={handleChange}
                  fullscreen={false}
                  onToggleFullscreen={() => setFullscreen("editor")}
                />
              </div>

              {/* Preview pane */}
              <div
                className={`flex-1 min-w-0 overflow-hidden ${
                  activeTab === "editor" ? "hidden sm:flex" : "flex"
                } flex-col`}
              >
                <Preview
                  markdown={markdown}
                  fullscreen={false}
                  onToggleFullscreen={() => setFullscreen("preview")}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
