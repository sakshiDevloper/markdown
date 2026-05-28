"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type UIEvent,
} from "react";
import { marked } from "marked";
import Navbar from "@/components/Navbar";
import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import Toolbar from "@/components/Toolbar";
import Footer from "@/components/Footer";
import FileTabs from "@/components/FileTabs";
import type { FileTab } from "@/components/FileTabs";
import PresentationMode from "@/components/PresentationMode";
import LintPanel from "@/components/LintPanel";
import { useKeybindEngine, VimEmacsToggle } from "@/components/KeybindEngine";
import ShortcutModal from "@/components/ShortcutModal";
import { sampleMarkdown } from "@/lib/sample";
import { FiEdit3, FiEye, FiShare2, FiMonitor, FiAlertCircle } from "react-icons/fi";
import { extractHeadingsFromMarkdown } from "@/lib/headings";
import { encodeShareLink, decodeShareLink, clearShareHash } from "@/lib/share";

type FullscreenMode = "none" | "editor" | "preview";
const LOCAL_STORAGE_KEY = "markdown-converter-content";
const FILES_STORAGE_KEY = "markdown-converter-files";

let fileCounter = 1;
function createNewFile(): FileTab {
  const id = `file-${Date.now()}-${fileCounter++}`;
  return { id, name: `untitled-${fileCounter - 1}.md`, content: "" };
}

function createDefaultFiles(): FileTab[] {
  return [
    { id: "default-1", name: "welcome.md", content: sampleMarkdown },
    { id: "default-2", name: "notes.md", content: "# Notes\n\nStart writing..." },
  ];
}

export default function Home() {
  const [files, setFiles] = useState<FileTab[]>(createDefaultFiles);
  const [activeFileId, setActiveFileId] = useState(files[0].id);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [fullscreen, setFullscreen] = useState<FullscreenMode>("none");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [showLint, setShowLint] = useState(false);
  const [keybindMode, setKeybindMode] = useState<"normal" | "vim" | "emacs">("normal");
  const [shareTooltip, setShareTooltip] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId) ?? files[0],
    [files, activeFileId],
  );

  const markdown = activeFile.content;
  const setMarkdown = useCallback(
    (newContent: string) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f)),
      );
    },
    [activeFileId],
  );
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const syncLockRef = useRef<"editor" | "preview" | null>(null);

  const parsedHtml = useMemo(() => {
    if (!markdown.trim()) return "";
    try {
      return marked.parse(markdown) as string;
    } catch {
      return "";
    }
  }, [markdown]);

  const tocHeadings = useMemo(
    () => extractHeadingsFromMarkdown(markdown),
    [markdown]
  );

  const handleChange = useCallback((value: string) => {
    setMarkdown(value);
  }, []);

  const handleReset = useCallback(() => {
    setMarkdown(sampleMarkdown);
  }, []);

  const handleClear = useCallback(() => {
    setMarkdown("");
  }, []);

  // File tabs handlers
  const handleAddFile = useCallback(() => {
    const newFile = createNewFile();
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  }, []);

  const handleDeleteFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        if (prev.length <= 1) return prev;
        const idx = prev.findIndex((f) => f.id === id);
        const filtered = prev.filter((f) => f.id !== id);
        if (id === activeFileId) {
          const newIdx = Math.min(idx, filtered.length - 1);
          setActiveFileId(filtered[newIdx].id);
        }
        return filtered;
      });
    },
    [activeFileId],
  );

  const handleRenameFile = useCallback((id: string, name: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name } : f)),
    );
  }, []);

  // Share link
  const handleShareLink = useCallback(() => {
    const url = encodeShareLink(markdown);
    navigator.clipboard.writeText(url).catch(() => {});
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  }, [markdown]);

  // Keybind engine
  useKeybindEngine({
    mode: keybindMode,
    textareaRef: editorRef,
    value: markdown,
    onChange: setMarkdown,
  });

  const syncScroll = useCallback(
    (
      source: "editor" | "preview",
      sourceElement: HTMLElement,
      targetElement: HTMLElement
    ) => {
      if (syncLockRef.current && syncLockRef.current !== source) return;
      syncLockRef.current = source;

      const sourceMaxScroll =
        sourceElement.scrollHeight - sourceElement.clientHeight;
      const ratio = sourceMaxScroll > 0 ? sourceElement.scrollTop / sourceMaxScroll : 0;
      const targetMaxScroll =
        targetElement.scrollHeight - targetElement.clientHeight;
      targetElement.scrollTop = ratio * targetMaxScroll;

      requestAnimationFrame(() => {
        if (syncLockRef.current === source) {
          syncLockRef.current = null;
        }
      });
    },
    []
  );

  const handleEditorScroll = useCallback(
    (event: UIEvent<HTMLTextAreaElement>) => {
      if (!previewScrollRef.current) return;
      syncScroll("editor", event.currentTarget, previewScrollRef.current);
    },
    [syncScroll]
  );

  const handlePreviewScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!editorRef.current) return;
      syncScroll("preview", event.currentTarget, editorRef.current);
    },
    [syncScroll]
  );

  const handleJumpToHeading = useCallback((id: string) => {
    setActiveTab("preview");
    const target = previewScrollRef.current?.querySelector<HTMLElement>(`#${id}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleExportPdf = useCallback(() => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");
    if (!printWindow) return;

    printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Markdown Export</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111827; margin: 32px; line-height: 1.6; }
      pre { background: #111827; color: #f9fafb; padding: 16px; border-radius: 10px; overflow: auto; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
      blockquote { border-left: 4px solid #6366f1; padding-left: 12px; color: #4b5563; }
    </style>
  </head>
  <body>${parsedHtml}</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 150);
  }, [parsedHtml]);

  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      if (storedFiles !== null) {
        const parsed = JSON.parse(storedFiles) as FileTab[];
        if (parsed.length > 0) {
          setFiles(parsed);
          setActiveFileId(parsed[0].id);
        }
      }
    } catch {
      // Ignore storage read errors.
    } finally {
      // Check for shared content in URL hash
      const shared = decodeShareLink();
      if (shared) {
        setFiles((prev) => [
          { id: "shared-1", name: "shared.md", content: shared },
          ...prev,
        ]);
        setActiveFileId("shared-1");
        clearShareHash();
      }
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
      } catch {
        // Ignore storage write errors.
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [files, isHydrated]);

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

              <div className="hidden sm:flex items-center gap-1">
                {/* Lint toggle */}
                <button
                  onClick={() => setShowLint(!showLint)}
                  title="Markdown linting"
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                    showLint
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-600/20 dark:text-amber-400"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <FiAlertCircle className="h-3.5 w-3.5" />
                </button>

                {/* Presentation mode */}
                <button
                  onClick={() => setPresenting(true)}
                  title="Presentation mode"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <FiMonitor className="h-3.5 w-3.5" />
                </button>

                {/* Share link */}
                <div className="relative">
                  <button
                    onClick={handleShareLink}
                    title="Copy shareable link"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  >
                    <FiShare2 className="h-3.5 w-3.5" />
                  </button>
                  {shareTooltip && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-[10px] text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
                      Link copied!
                    </span>
                  )}
                </div>

                {/* Keybind toggle */}
                <VimEmacsToggle mode={keybindMode} onChange={setKeybindMode} />
              </div>

              {/* Sidebar toggle â€” always visible in toolbar */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? "Close outline" : "Open outline"}
                className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                  sidebarOpen
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="15" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              {/* Action buttons: reset, clear, copy, download */}
              <Toolbar
                html={parsedHtml}
                onReset={handleReset}
                onClear={handleClear}
                onExportPdf={handleExportPdf}
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
                  textareaRef={editorRef}
                  onScroll={handleEditorScroll}
                  fullscreen={true}
                  onToggleFullscreen={() => setFullscreen("none")}
                  fileName={activeFile.name}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen single pane (preview) */}
        {isPreviewFullscreen && (
          <div className="flex flex-1 overflow-hidden bg-white px-4 py-4 dark:bg-zinc-950 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl gap-4">
              <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-black">
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
                  scrollRef={previewScrollRef}
                  onScroll={handlePreviewScroll}
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
                <FileTabs
                  files={files}
                  activeFileId={activeFileId}
                  onSelectFile={setActiveFileId}
                  onAddFile={handleAddFile}
                  onDeleteFile={handleDeleteFile}
                  onRenameFile={handleRenameFile}
                />
                <Editor
                  value={markdown}
                  onChange={handleChange}
                  textareaRef={editorRef}
                  onScroll={handleEditorScroll}
                  fullscreen={false}
                  onToggleFullscreen={() => setFullscreen("editor")}
                  fileName={activeFile.name}
                />
              </div>

              {/* Preview pane */}
              <div
                className={`flex-1 min-w-0 overflow-hidden ${
                  activeTab === "editor" ? "hidden sm:flex" : "flex"
                } flex-col`}
              >
                <div className="flex h-full gap-3">
                  {/* Sidebar outline panel */}
                  {sidebarOpen && (
                    <aside className="w-56 shrink-0 animate-slide-in overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Outline
                      </p>
                      <nav className="space-y-1">
                        {tocHeadings.length === 0 ? (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Add headings to build a table of contents.
                          </p>
                        ) : (
                          tocHeadings.map((heading) => (
                            <button
                              key={heading.id}
                              onClick={() => handleJumpToHeading(heading.id)}
                              className="block w-full truncate rounded px-2 py-1 text-left text-xs text-zinc-700 transition hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              style={{ paddingLeft: `${heading.depth * 10}px` }}
                              title={heading.text}
                            >
                              {heading.text}
                            </button>
                          ))
                        )}
                      </nav>
                    </aside>
                  )}
                  <div className="min-w-0 flex-1">
                    <Preview
                      markdown={markdown}
                      scrollRef={previewScrollRef}
                      onScroll={handlePreviewScroll}
                      fullscreen={false}
                      onToggleFullscreen={() => setFullscreen("preview")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lint panel (below toolbar, above split panes) */}
        {showLint && (
          <div className="px-4 py-2 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <LintPanel markdown={markdown} onClose={() => setShowLint(false)} />
            </div>
          </div>
        )}
      </main>

      {/* Presentation mode overlay */}
      {presenting && (
        <PresentationMode markdown={markdown} onClose={() => setPresenting(false)} />
      )}

      <Footer />
    </div>
  );
}

