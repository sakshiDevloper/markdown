"use client";

import type { ChangeEvent, RefObject, UIEvent } from "react";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  onScroll?: (event: UIEvent<HTMLTextAreaElement>) => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  fileName?: string;
  // Import/Export handlers
  onImport?: () => void;
  onExport?: () => void;
  onMarkdownDrop?: (content: string, fileName: string) => void;
}

function wrapSelection(
  text: string,
  start: number,
  end: number,
  before: string,
  after: string
) {
  return text.slice(0, start) + before + text.slice(start, end) + after + text.slice(end);
}

function insertAtCursor(
  text: string,
  start: number,
  end: number,
  insertion: string
) {
  return text.slice(0, start) + insertion + text.slice(end);
}

function readImageAsMarkdown(
  file: File,
  callback: (markdownImage: string) => void,
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    const markdownImage = `![${file.name}](${dataUrl})`;
    callback(markdownImage);
  };
  reader.readAsDataURL(file);
}

export default function Editor({
  value,
  onChange,
  textareaRef,
  onScroll,
  fullscreen,
  onToggleFullscreen,
  fileName = "markdown.md",
  onImport,
  onExport,
  onMarkdownDrop,
}: EditorProps) {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = textareaRef || internalRef;
  const [showFind, setShowFind] = useState(false);

  const getTextarea = () => ref && "current" in ref ? ref.current : null;

  const applyShortcut = useCallback(
    (action: "bold" | "italic" | "code" | "codeblock" | "link" | "strikethrough" | "heading" | "blockquote" | "ul" | "ol") => {
      const ta = getTextarea();
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;

      let newValue: string;
      let newCursorPos = start;

      switch (action) {
        case "bold":
          newValue = wrapSelection(value, start, end, "**", "**");
          newCursorPos = end + 4;
          break;
        case "italic":
          newValue = wrapSelection(value, start, end, "_", "_");
          newCursorPos = end + 2;
          break;
        case "strikethrough":
          newValue = wrapSelection(value, start, end, "~~", "~~");
          newCursorPos = end + 4;
          break;
        case "codeblock": {
          // Insert fenced code block
          const codeContent = value.slice(start, end) || "code";
          newValue = value.slice(0, start) + "```\n" + codeContent + "\n```" + value.slice(end);
          newCursorPos = start + 4 + codeContent.length + 4;
          break;
        }
        case "code": {
          if (start === end) {
            newValue = insertAtCursor(value, start, end, "``");
            newCursorPos = start + 1;
          } else {
            const sel = value.slice(start, end);
            if (sel.includes("\n")) {
              newValue = wrapSelection(value, start, end, "```\n", "\n```");
              newCursorPos = end + 10;
            } else {
              newValue = wrapSelection(value, start, end, "`", "`");
              newCursorPos = end + 2;
            }
          }
          break;
        }
        case "link": {
          const selected = value.slice(start, end);
          const hasSelection = selected.length > 0;
          const displayText = hasSelection ? selected : "text";
          const url = hasSelection ? "url" : "url";
          const insertion = `[${displayText}](${url})`;
          newValue = insertAtCursor(value, start, end, insertion);
          newCursorPos = start + insertion.length;
          break;
        }
        case "heading": {
          const lineStart = value.lastIndexOf("\n", start - 1) + 1;
          newValue = value.slice(0, lineStart) + "# " + value.slice(lineStart);
          newCursorPos = start + 2;
          break;
        }
        case "blockquote": {
          const lineStart = value.lastIndexOf("\n", start - 1) + 1;
          newValue = value.slice(0, lineStart) + "> " + value.slice(lineStart);
          newCursorPos = start + 2;
          break;
        }
        case "ul": {
          const lineStart = value.lastIndexOf("\n", start - 1) + 1;
          newValue = value.slice(0, lineStart) + "- " + value.slice(lineStart);
          newCursorPos = start + 2;
          break;
        }
        case "ol": {
          const lineStart = value.lastIndexOf("\n", start - 1) + 1;
          newValue = value.slice(0, lineStart) + "1. " + value.slice(lineStart);
          newCursorPos = start + 3;
          break;
        }
        default:
          return;
      }

      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = newCursorPos;
      });
    },
    [value, onChange, ref],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const target = e.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newValue = value.slice(0, start) + "  " + value.slice(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 2;
        });
        return;
      }

      if (e.key === "f" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        setShowFind((v) => !v);
        return;
      }
      if (e.key === "h" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowFind((v) => !v);
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          applyShortcut("bold");
          break;
        case "i":
          e.preventDefault();
          applyShortcut("italic");
          break;
        case "k":
          e.preventDefault();
          applyShortcut("link");
          break;
        case "`":
          e.preventDefault();
          applyShortcut("code");
          break;
      }
    },
    [value, onChange, applyShortcut],
  );

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Drag & drop / paste images â€” insert at cursor position
  const insertImageAtCursor = useCallback(
    (markdownImage: string) => {
      const ta = getTextarea();
      if (!ta) {
        onChange(value + "\n" + markdownImage);
        return;
      }
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue =
        value.slice(0, start) + markdownImage + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + markdownImage.length;
      });
    },
    [value, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      for (const file of Array.from(e.dataTransfer.files)) {
        if (file.type.startsWith("image/")) {
          readImageAsMarkdown(file, insertImageAtCursor);
        }
        // Handle markdown/text file drops
        else if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            if (onMarkdownDrop) {
              onMarkdownDrop(content, file.name);
            }
          };
          reader.readAsText(file);
        }
      }
    },
    [insertImageAtCursor, onMarkdownDrop],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            readImageAsMarkdown(file, insertImageAtCursor);
          }
        }
      }
    },
    [insertImageAtCursor],
  );

  // Word count & reading time
  const stats = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return { chars: 0, words: 0, lines: 1, readingTime: 0 };
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const chars = trimmed.length;
    const lines = value.split("\n").length;
    const readingTime = Math.ceil(words / 200);
    return { chars, words, lines, readingTime };
  }, [value]);

  // Find & replace inline
  const performFindReplace = useCallback(
    (find: string, replaceWith: string, all: boolean) => {
      if (!find) return;
      try {
        if (all) {
          const regex = new RegExp(escapeRegex(find), "gi");
          onChange(value.replace(regex, replaceWith));
        } else {
          // Single replace â€” first occurrence only
          onChange(value.replace(find, replaceWith));
        }
      } catch {
        // regex error â€” skip
      }
    },
    [value, onChange],
  );

  const lineCount = value.split("\n").length;
  const gutterWidth = Math.max(3, String(lineCount).length);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/80 dark:shadow-lg dark:shadow-black/30">
      {/* Editor toolbar/header with formatting buttons */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800/40 dark:bg-zinc-900/40">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/20"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/20"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>
          <span className="ml-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-32">
            {fileName}
          </span>
        </div>

        {/* Formatting shortcut buttons */}
        <div className="flex items-center gap-0.5">
          <FmtBtn onClick={() => applyShortcut("bold")} title="Bold (Ctrl+B)">
            <strong className="text-xs">B</strong>
          </FmtBtn>
          <FmtBtn onClick={() => applyShortcut("italic")} title="Italic (Ctrl+I)">
            <em className="text-xs">I</em>
          </FmtBtn>
          <FmtBtn onClick={() => applyShortcut("strikethrough")} title="Strikethrough">
            <span className="text-xs line-through">S</span>
          </FmtBtn>
          <span className="mx-0.5 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
          <FmtBtn onClick={() => applyShortcut("code")} title="Code (Ctrl+`)">
            <span className="font-mono text-xs">{`<>`}</span>
          </FmtBtn>
          <FmtBtn onClick={() => applyShortcut("link")} title="Link (Ctrl+K)">
            <span className="text-xs underline">L</span>
          </FmtBtn>
          <span className="mx-0.5 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
          <FmtBtn onClick={() => applyShortcut("heading")} title="Heading">
            <span className="text-xs">H</span>
          </FmtBtn>
          <FmtBtn onClick={() => applyShortcut("blockquote")} title="Blockquote">
            <span className="text-xs">{'"'}</span>
          </FmtBtn>
          <FmtBtn onClick={() => applyShortcut("ul")} title="Bullet list">
            <span className="text-xs">â€¢</span>
          </FmtBtn>
          <FmtBtn onClick={() => applyShortcut("ol")} title="Numbered list">
            <span className="text-xs">1.</span>
          </FmtBtn>
          <span className="mx-0.5 h-4 w-px bg-zinc-300 dark:bg-zinc-600" />
          <FmtBtn onClick={() => setShowFind((v) => !v)} title="Find & Replace (Ctrl+H)">
            <FiSearch className="h-3 w-3" />
          </FmtBtn>
          {/* Import/Export buttons */}
          {onImport && (
            <FmtBtn onClick={onImport} title="Import markdown file">
              <span className="text-xs">📥</span>
            </FmtBtn>
          )}
          {onExport && (
            <FmtBtn onClick={onExport} title="Export as markdown">
              <span className="text-xs">📤</span>
            </FmtBtn>
          )}
        </div>

        {/* File name + fullscreen */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {fileName}
          </span>
          <button
            onClick={onToggleFullscreen}
            title={fullscreen ? "Exit fullscreen" : "Fullscreen editor"}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-all hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              {fullscreen ? (
                <>
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              ) : (
                <>
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Find & Replace panel */}
      {showFind && (
        <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800/40">
          <InlineFindReplace
            text={value}
            onReplace={(find, replaceWith, all) => {
              performFindReplace(find, replaceWith, all);
            }}
            onClose={() => setShowFind(false)}
          />
        </div>
      )}

      {/* Editor content area */}
      <div className="flex flex-1 overflow-hidden bg-white dark:bg-zinc-950">
        <div
          className="select-none border-r border-zinc-200 bg-zinc-50 px-3 py-4 text-right font-mono text-xs leading-6 text-zinc-500 dark:border-zinc-800/40 dark:bg-zinc-900/50 dark:text-zinc-600"
          style={{ width: `${gutterWidth + 2}ch`, minWidth: "3.5ch" }}
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-500">
              {i + 1}
            </div>
          ))}
        </div>

        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={onScroll}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onPaste={handlePaste}
          spellCheck={false}
          placeholder="// Enter your markdown here...
// Try: # Heading, **bold**, `code`

# Welcome"
          className="flex-1 resize-none border-0 bg-transparent py-4 pl-3 pr-4 font-mono text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 caret-indigo-500 outline-none focus:ring-0 focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-600 dark:caret-indigo-400"
        />
      </div>

      {/* Bottom status bar with word count + reading time */}
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800/40 dark:bg-zinc-900/40 dark:text-zinc-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>{stats.lines} lines</span>
            <span className="hidden sm:inline">{stats.words} words</span>
            <span>{stats.chars} chars</span>
            <span className="hidden sm:inline">
              ~{stats.readingTime} min read
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <span className="text-emerald-600 dark:text-emerald-400">UTF-8</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-zinc-400" title="Drop or paste images to insert">
              ðŸ“· Paste/Drop images
            </span>
            <span>LF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FmtBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-all hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
    >
      {children}
    </button>
  );
}

function InlineFindReplace({
  text,
  onReplace,
  onClose,
}: {
  text: string;
  onReplace: (find: string, replaceWith: string, all: boolean) => void;
  onClose: () => void;
}) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");

  const matchCount = useMemo(() => {
    if (!find) return 0;
    try {
      const matches = text.match(new RegExp(escapeRegex(find), "gi"));
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [text, find]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-30">
        <FiSearch className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
        <input
          value={find}
          onChange={(e) => setFind(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onReplace(find, replace, false);
            if (e.key === "Escape") onClose();
          }}
          placeholder="Find..."
          className="w-full rounded border border-zinc-300 bg-zinc-50 py-1 pl-7 pr-2 text-xs outline-none focus:border-indigo-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <input
        value={replace}
        onChange={(e) => setReplace(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onReplace(find, replace, false);
          if (e.key === "Escape") onClose();
        }}
        placeholder="Replace..."
        className="flex-1 min-w-25 rounded border border-zinc-300 bg-zinc-50 py-1 px-2 text-xs outline-none focus:border-indigo-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      />
      {find && (
        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
          {matchCount} match{matchCount !== 1 ? "es" : ""}
        </span>
      )}
      <button
        onClick={() => onReplace(find, replace, false)}
        disabled={!find}
        className="rounded bg-indigo-600 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
      >
        Replace
      </button>
      <button
        onClick={() => onReplace(find, replace, true)}
        disabled={!find}
        className="rounded border border-zinc-300 px-2.5 py-1 text-[10px] font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        All
      </button>
      <button
        onClick={onClose}
        className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <FiX className="h-3 w-3" />
      </button>
    </div>
  );
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
