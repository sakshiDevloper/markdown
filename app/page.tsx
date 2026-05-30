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
import ShortcutModal from "@/components/ShortcutModal";
import { sampleMarkdown } from "@/lib/sample";
import { FiEdit3, FiEye, FiShare2, FiMonitor } from "react-icons/fi";
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
  const [activeFileId, setActiveFileId] = useState("default-1");
  const TAB_STORAGE_KEY = "markdown-converter-tab";
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [fullscreen, setFullscreen] = useState<FullscreenMode>("none");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [splitPercent, setSplitPercent] = useState(50);
  const dragCounterRef = useRef(0);

  // Recent files tracking
  const RECENT_FILES_KEY = "markdown-converter-recent";
  const [recentFiles, setRecentFiles] = useState<Array<{ id: string; name: string; timestamp: number }>>([]);

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
  }, [setMarkdown]);

  const handleReset = useCallback(() => {
    setMarkdown(sampleMarkdown);
  }, [setMarkdown]);

  const handleClear = useCallback(() => {
    setMarkdown("");
  }, [setMarkdown]);

  // Track recently accessed files
  const trackRecentFile = useCallback((fileId: string, fileName: string) => {
    setRecentFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      const newRecent = [{ id: fileId, name: fileName, timestamp: Date.now() }, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(newRecent));
      } catch {}
      return newRecent;
    });
  }, []);

  // File tabs handlers
  const handleAddFile = useCallback(() => {
    let fileName = window.prompt("File name:", "untitled.md");
    if (!fileName) return;
    if (!fileName.endsWith(".md")) fileName += ".md";
    const newFile = createNewFile();
    newFile.name = fileName;
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    trackRecentFile(newFile.id, newFile.name);
  }, [trackRecentFile]);

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
    trackRecentFile(id, name);
  }, [trackRecentFile]);

  // Open rename dialog for a file
  const handleRenameWithPrompt = useCallback((id: string, currentName: string) => {
    const newName = window.prompt("Rename file:", currentName);
    if (!newName) return;
    const finalName = newName.endsWith(".md") ? newName : newName + ".md";
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: finalName } : f)),
    );
    trackRecentFile(id, finalName);
  }, [trackRecentFile]);

  // Import markdown file
  const handleImportMarkdown = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newFile: FileTab = {
          id: `file-${Date.now()}-${fileCounter++}`,
          name: file.name,
          content: content,
        };
        setFiles((prev) => [newFile, ...prev]);
        setActiveFileId(newFile.id);
        trackRecentFile(newFile.id, newFile.name);
      };
      reader.readAsText(file);
    };
    input.click();
  }, [trackRecentFile]);

  // Export markdown file
  const handleExportMarkdown = useCallback(() => {
    const defaultName = activeFile.name.replace(/\.[^.]+$/, "") || "untitled";
    const fileName = window.prompt("Export filename:", defaultName + ".md");
    if (!fileName) return;
    const element = document.createElement("a");
    const file = new Blob([markdown], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }, [markdown, activeFile.name]);

  // Handle markdown file drop
  const handleMarkdownFileDrop = useCallback(
    (content: string, fileName: string) => {
      const newFile: FileTab = {
        id: `file-${Date.now()}-${fileCounter++}`,
        name: fileName,
        content: content,
      };
      setFiles((prev) => [newFile, ...prev]);
      setActiveFileId(newFile.id);
      trackRecentFile(newFile.id, newFile.name);
    },
    [trackRecentFile],
  );

  // Share link
  const handleShareLink = useCallback(() => {
    const url = encodeShareLink(markdown);
    navigator.clipboard.writeText(url).catch(() => {});
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  }, [markdown]);



  // Global "?" key opens shortcut reference modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          setShowShortcuts((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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

  useEffect(() => {
    // Restore persisted state from localStorage after hydration
    try {
      const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      if (storedFiles) {
        const parsed = JSON.parse(storedFiles) as FileTab[];
        if (parsed.length > 0) {
          setFiles(parsed);
          setActiveFileId(parsed[0].id);
        }
      }
    } catch {}

    try {
      const storedTab = localStorage.getItem(TAB_STORAGE_KEY);
      if (storedTab === "editor" || storedTab === "preview") {
        setActiveTab(storedTab);
      }
    } catch {}

    try {
      const storedRecent = localStorage.getItem(RECENT_FILES_KEY);
      if (storedRecent) {
        setRecentFiles(JSON.parse(storedRecent));
      }
    } catch {}

    // Check for shared content in URL hash (only once after mount)
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
  }, []);

  // Track recently accessed files when activeFileId changes
  useEffect(() => {
    if (!isHydrated) return;
    const currentFile = files.find((f) => f.id === activeFileId);
    if (currentFile) {
      trackRecentFile(activeFileId, currentFile.name);
    }
  }, [activeFileId, files, isHydrated, trackRecentFile]);

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

  // Persist activeTab
  useEffect(() => {
    try {
      localStorage.setItem(TAB_STORAGE_KEY, activeTab);
    } catch {}
  }, [activeTab]);

  // Determine layout class based on fullscreen state
  const isEditorFullscreen = fullscreen === "editor";
  const isPreviewFullscreen = fullscreen === "preview";

  // Global drag & drop for markdown/text files
  const handleGlobalDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.some((t) => t === "Files")) {
      setDragOver(true);
    }
  }, []);

  const handleGlobalDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setDragOver(false);
    }
  }, []);

  const handleGlobalDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleGlobalDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      dragCounterRef.current = 0;
      for (const file of Array.from(e.dataTransfer.files)) {
        if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            const newFile: FileTab = {
              id: `file-${Date.now()}-${fileCounter++}`,
              name: file.name,
              content,
            };
            setFiles((prev) => [newFile, ...prev]);
            setActiveFileId(newFile.id);
            trackRecentFile(newFile.id, newFile.name);
          };
          reader.readAsText(file);
        }
      }
    },
    [trackRecentFile],
  );

  return (
    <div
      className="flex min-h-screen flex-col bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100"
      onDragEnter={handleGlobalDragEnter}
      onDragLeave={handleGlobalDragLeave}
      onDragOver={handleGlobalDragOver}
      onDrop={handleGlobalDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-500/10 backdrop-blur-sm pointer-events-none">
          <div className="rounded-2xl border-2 border-dashed border-indigo-400 bg-white/90 px-10 py-8 shadow-xl dark:bg-zinc-900/90 dark:border-indigo-500">
            <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              Drop .md or .txt file here
            </p>
          </div>
        </div>
      )}
      <Navbar recentFiles={recentFiles} activeFileName={activeFile?.name} onSelectFile={setActiveFileId} />

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
            <div className="mx-auto flex w-full max-w-6xl overflow-hidden" style={{ gap: 0 }}>
              {/* Editor pane */}
              <div
                className={`min-w-0 overflow-hidden ${
                  activeTab === "preview" ? "hidden sm:flex" : "flex"
                } flex-col`}
                style={{ width: `${splitPercent}%` }}
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
                  onImport={handleImportMarkdown}
                  onExport={handleExportMarkdown}
                  onMarkdownDrop={handleMarkdownFileDrop}
                />
                {/* Mobile preview below editor */}
                <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 mt-4 pt-4 sm:hidden">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 px-2">
                    Preview
                  </div>
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-black max-h-64 overflow-y-auto">
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

              {/* Draggable divider */}
              <div
                className="w-1.5 cursor-col-resize shrink-0 bg-zinc-200 hover:bg-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-600 transition-colors relative mx-1 rounded-full"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startPercent = splitPercent;
                  const container = (e.currentTarget as HTMLElement).parentElement;
                  if (!container) return;
                  const containerWidth = container.getBoundingClientRect().width;
                  const onMouseMove = (ev: MouseEvent) => {
                    const dx = ev.clientX - startX;
                    const newPercent = Math.min(85, Math.max(15, startPercent + (dx / containerWidth) * 100));
                    setSplitPercent(newPercent);
                  };
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
              </div>

              {/* Preview pane */}
              <div
                className={`min-w-0 overflow-hidden ${
                  activeTab === "editor" ? "hidden sm:flex" : "flex"
                } flex-col`}
                style={{ width: `${100 - splitPercent}%` }}
              >
                <div className="flex h-full gap-3">
                  <div className="min-w-0 flex-1">
                    <Preview
                      markdown={markdown}
                      scrollRef={previewScrollRef}
                      onScroll={handlePreviewScroll}
                      fullscreen={false}
                      onToggleFullscreen={() => setFullscreen("preview")}
                    />
                  </div>
                {/* Sidebar outline panel — professional right side panel */}
                {sidebarOpen && (
                  <aside className="w-64 shrink-0 border-l border-zinc-200 bg-white dark:border-zinc-800/60 dark:bg-zinc-950 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800/40">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400">
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <line x1="3" y1="12" x2="15" y2="12" />
                          <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                          Outline
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                        {tocHeadings.length}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-2">
                      {tocHeadings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-zinc-300 dark:text-zinc-600 mb-2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                            No headings found
                          </p>
                          <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-0.5">
                            Add # headings to build outline
                          </p>
                        </div>
                      ) : (
                        <nav className="space-y-0.5">
                          {tocHeadings.map((heading) => (
                            <button
                              key={heading.id}
                              onClick={() => handleJumpToHeading(heading.id)}
                              className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
                              title={heading.text}
                            >
                              {/* Depth indicator */}
                              <span
                                className="shrink-0 rounded-sm"
                                style={{
                                  width: `${heading.depth * 4}px`,
                                  height: "2px",
                                  backgroundColor: `var(--depth-color, ${heading.depth === 1 ? "#6366f1" : heading.depth === 2 ? "#8b5cf6" : "#a78bfa"})`,
                                  opacity: 0.5 + heading.depth * 0.1,
                                }}
                              />
                              <span className="truncate flex-1">{heading.text}</span>
                            </button>
                          ))}
                        </nav>
                      )}
                    </div>
                  </aside>
                )}
                </div>
              </div>
            </div>
          </div>
        )}


      </main>

      {/* Presentation mode overlay */}
      {presenting && (
        <PresentationMode markdown={markdown} onClose={() => setPresenting(false)} />
      )}

      {showShortcuts && <ShortcutModal onClose={() => setShowShortcuts(false)} />}
      <Footer />
    </div>
  );
}


