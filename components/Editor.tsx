"use client";

import type { ChangeEvent, RefObject, UIEvent } from "react";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  onScroll?: (event: UIEvent<HTMLTextAreaElement>) => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

// Professional code sandbox-style markdown editor
// Styled like VS Code, CodeSandbox, or StackBlitz
export default function Editor({
  value,
  onChange,
  textareaRef,
  onScroll,
  fullscreen,
  onToggleFullscreen,
}: EditorProps) {
  // Handle text input changes
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Handle tab key to insert 2 spaces instead of switching focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.slice(0, start) + "  " + value.slice(end);
      onChange(newValue);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  // Calculate line count for line numbers gutter
  const lineCount = value.split("\n").length;
  const gutterWidth = Math.max(3, String(lineCount).length);

  

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/80 dark:shadow-lg dark:shadow-black/30">
      {/* Editor toolbar/header with window controls */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800/40 dark:bg-zinc-900/40">
        {/* Fake window controls (red, yellow, green dots) */}
        <div className="flex gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/20"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/20"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>
        </div>

        {/* Editor title/filename */}
        <div className="flex-1 px-4 text-center">
          <p className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            markdown.md
          </p>
        </div>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          title={fullscreen ? "Exit fullscreen" : "Fullscreen editor"}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-all hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
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

      {/* Editor content area - line numbers and textarea */}
      <div className="flex flex-1 overflow-hidden bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-black">
        {/* Line numbers gutter */}
        <div
          className="select-none border-r border-zinc-200 bg-zinc-50 px-3 py-4 text-right font-mono text-xs leading-6 text-zinc-500 dark:border-zinc-800/40 dark:bg-zinc-900/50 dark:text-zinc-600"
          style={{ width: `${gutterWidth + 2}ch`, minWidth: "3.5ch" }}
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-500"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea for markdown input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={onScroll}
          spellCheck={false}
          placeholder="// Enter your markdown here...
// Try: # Heading, **bold**, `code`

# Welcome"
          className="flex-1 resize-none border-0 bg-transparent py-4 pl-3 pr-4 font-mono text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 caret-indigo-500 outline-none focus:ring-0 focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-600 dark:caret-indigo-400"
        />
      </div>

      {/* Bottom status bar for aesthetics */}
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800/40 dark:bg-zinc-900/40 dark:text-zinc-500">
        <div className="flex items-center justify-between">
          <div>
            {lineCount} lines &middot; {value.length} characters
          </div>
          <div>UTF-8 &middot; LF</div>
        </div>
      </div>
    </div>
  );
}