"use client";

import {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  type UIEvent,
  type RefObject,
} from "react";

import { marked } from "marked";
import hljs from "highlight.js";
import { createSlugger } from "@/lib/headings";
import { replaceEmojiShortcodes, calculateTaskProgress } from "@/lib/extras";

interface PreviewProps {
  markdown: string;
  scrollRef?: RefObject<HTMLDivElement | null>;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
} as never);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default function Preview({
  markdown,
  scrollRef,
  onScroll,
  fullscreen,
  onToggleFullscreen,
}: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"preview" | "html">("preview");
  const [taskProgress, setTaskProgress] = useState({ done: 0, total: 0 });

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      previewRef.current = node;
      if (scrollRef) {
        scrollRef.current = node;
      }
    },
    [scrollRef]
  );

  useEffect(() => {
    setTaskProgress(calculateTaskProgress(markdown));
  }, [markdown]);

  // Markdown → HTML
  const html = useMemo(() => {
    if (!markdown.trim()) {
      return `
      <div class="flex h-full flex-col items-center justify-center">
        <div class="text-center">
          <p class="text-sm font-medium text-zinc-500">
            No preview
          </p>

          <p class="mt-1 text-xs text-zinc-600">
            Start typing markdown to see the preview...
          </p>
        </div>
      </div>
      `;
    }

    try {
      const slugger = createSlugger();
      const renderer = new marked.Renderer();

      renderer.heading = ({ text, depth }) => {
        const id = slugger(text);
        const emojiText = replaceEmojiShortcodes(text);
        return `<h${depth} id="${id}" class="font-bold text-zinc-900 dark:text-zinc-100 ${
          depth === 1 ? "text-2xl mt-6 mb-3" : depth === 2 ? "text-xl mt-5 mb-2" : "text-lg mt-4 mb-2"
        }">${emojiText}</h${depth}>`;
      };

      renderer.paragraph = ({ text }) => `<p class="my-2 leading-relaxed text-zinc-800 dark:text-zinc-200">${replaceEmojiShortcodes(text)}</p>`;

      renderer.code = ({ text, lang }) => {
        const normalized = (lang ?? "").trim().toLowerCase();
        if (normalized === "mermaid") {
          return `<pre class="mermaid my-4">${escapeHtml(text)}</pre>`;
        }

        const language =
          normalized && hljs.getLanguage(normalized) ? normalized : "plaintext";
        let highlighted: string;

        try {
          highlighted = hljs.highlight(text, { language }).value;
        } catch {
          highlighted = hljs.highlightAuto(text).value;
        }

        const safeText = encodeURIComponent(text);
        return `
  <div class="code-block-wrapper relative group my-4 overflow-hidden rounded-xl border border-zinc-700/30 bg-zinc-900/60 shadow-lg">
    <div class="flex items-center justify-between border-b border-zinc-700/20 bg-zinc-800/40 px-4 py-2.5">
      <span class="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        ${language}
      </span>
      <button
        data-copy="${safeText}"
        class="code-copy-btn rounded-md px-2.5 py-1 text-[10px] font-medium text-zinc-500 transition-all hover:bg-zinc-700/50 hover:text-zinc-200 opacity-0 group-hover:opacity-100"
      >
        Copy
      </button>
    </div>
    <pre class="overflow-x-auto p-4">
      <code class="hljs language-${language}">
${highlighted}
      </code>
    </pre>
  </div>
  `;
      };

      // GFM: Task list items
      renderer.listitem = ({ text, task, checked }) => {
        if (task) {
          return `<li class="flex items-start gap-2 my-1.5 text-zinc-800 dark:text-zinc-200"><input type="checkbox" ${
            checked ? "checked" : ""
          } disabled class="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-400 text-indigo-600 accent-indigo-600 dark:border-zinc-600 dark:accent-indigo-500" /><span>${
            checked ? `<span class="line-through text-zinc-400 dark:text-zinc-500">${text}</span>` : text
          }</span></li>`;
        }
        // Regular list item inherited styling via prose
        return `<li class="my-1 text-zinc-800 dark:text-zinc-200">${text}</li>`;
      };

      // GFM: Tables with nicer styling
      renderer.table = ({ header, rows }) => {
        const headerHtml = header
          .map((cell) => `<th class="border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-300">${cell.text}</th>`)
          .join("");
        const rowsHtml = rows
          .map(
            (row) =>
              `<tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">${row
                .map((cell) => `<td class="border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300">${cell.text}</td>`)
                .join("")}</tr>`,
          )
          .join("");
        return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse">${header ? `<thead>${headerHtml}</thead>` : ""}<tbody>${rowsHtml}</tbody></table></div>`;
      };

      // GFM: Strikethrough
      renderer.del = ({ text }) => `<del class="text-zinc-400 dark:text-zinc-500 line-through">${text}</del>`;

      return marked.parse(markdown, { renderer }) as string;
    } catch {
      return `
      <p class="text-sm text-red-400">
        Error parsing markdown
      </p>
      `;
    }
  }, [markdown]);

  useEffect(() => {
    if (mode !== "preview" || !previewRef.current) return;
    const container = previewRef.current;
    const mermaidNodes = container.querySelectorAll("pre.mermaid");
    if (!mermaidNodes.length) return;

    let cancelled = false;

    import("mermaid").then((mod) => {
      if (cancelled) return;

      const mermaid = mod.default;
      mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
      mermaid.run({ nodes: Array.from(mermaidNodes) as HTMLElement[] }).catch(() => {
        // Keep fallback raw Mermaid text when rendering fails.
      });
    });

    return () => {
      cancelled = true;
    };
  }, [html, mode]);

  // Copy code block button
  const handlePreviewClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;

      if (target.classList.contains("code-copy-btn")) {
        const text = decodeURIComponent(
          target.getAttribute("data-copy") || ""
        );

        navigator.clipboard
          .writeText(text)
          .then(() => {
            const original = target.textContent;

            target.textContent = "Copied!";

            setTimeout(() => {
              target.textContent = original;
            }, 1500);
          })
          .catch(() => {
            const textarea = document.createElement("textarea");

            textarea.value = text;

            document.body.appendChild(textarea);

            textarea.select();

            document.execCommand("copy");

            document.body.removeChild(textarea);
          });
      }
    },
    []
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-black dark:shadow-lg dark:shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800/40 dark:bg-zinc-900/40">
        {/* Fake controls */}
        <div className="flex gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>

          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>

          <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
        </div>

        {/* Title */}
        <div className="flex-1 px-4 text-center">
          <p className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            preview.html
          </p>
        </div>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title={fullscreen ? "Exit fullscreen" : "Fullscreen preview"}
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

      {/* Toggle */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          onClick={() => setMode("preview")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "preview"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          Preview
        </button>

        <button
          onClick={() => setMode("html")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "html"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          Raw HTML
        </button>
      </div>

      {/* Content */}
      <div
        ref={mergedRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto overscroll-contain bg-linear-to-b from-white to-zinc-50 dark:from-black dark:to-black"
      >
       {mode === "preview" ? (
  <div
    className="preview-content space-y-4 px-6 py-6 text-zinc-900 dark:text-zinc-100"
    onClick={handlePreviewClick}
  >
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
      className="max-w-none"
    />
  </div>
) : (
          <div className="h-full p-6">
            <pre className="h-full overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
              <code>{html}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800/40 dark:bg-zinc-900/40 dark:text-zinc-500">
        <div className="flex items-center justify-between">
          <div>
            {mode === "preview"
              ? "HTML Preview"
              : "Raw HTML Output"}
          </div>

          <div>UTF-8</div>
        </div>
      </div>
    </div>
  );
}

