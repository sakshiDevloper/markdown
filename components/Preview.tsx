// "use client";

// import { useMemo, useCallback, useRef } from "react";
// import { marked } from "marked";
// import hljs from "highlight.js";

// interface PreviewProps {
//   markdown: string;
//   fullscreen?: boolean;
//   onToggleFullscreen?: () => void;
// }

// // Configure marked to use highlight.js for code highlighting
// marked.setOptions({
//   gfm: true,
//   breaks: true,
// } as never);

// // Custom renderer for code blocks with accessible copy button
// const renderer = new marked.Renderer();

// let copyIndex = 0;

// renderer.code = ({ text, lang }) => {
//   const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
//   let highlighted: string;
//   try {
//     highlighted = hljs.highlight(text, { language }).value;
//   } catch {
//     highlighted = hljs.highlightAuto(text).value;
//   }
//   const id = `copy-btn-${++copyIndex}`;
//   return `<div class="code-block-wrapper relative group my-4 overflow-hidden rounded-lg border border-zinc-700/30 bg-zinc-900/60 shadow-lg">
//   <div class="flex items-center justify-between border-b border-zinc-700/20 bg-zinc-800/40 px-4 py-2.5">
//     <span class="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">${language}</span>
//     <button id="${id}" data-copy="${encodeURIComponent(text)}" class="code-copy-btn rounded-md px-2.5 py-1 text-[10px] font-medium text-zinc-500 transition-all hover:bg-zinc-700/50 hover:text-zinc-200 opacity-0 group-hover:opacity-100">Copy</button>
//   </div>
//   <pre class="overflow-x-auto p-4"><code class="hljs language-${language}">${highlighted}</code></pre>
// </div>`;
// };

// marked.use({ renderer });

// // Live HTML preview component for rendered markdown
// export default function Preview({ markdown, fullscreen, onToggleFullscreen }: PreviewProps) {
//   const previewRef = useRef<HTMLDivElement>(null);

//   // Parse markdown to HTML and memoize
//   const html = useMemo(() => {
//     if (!markdown.trim()) {
//       return '<div class="flex flex-col items-center justify-center h-full"><div class="text-center"><p class="text-zinc-500 text-sm font-medium">No preview</p><p class="text-zinc-600 text-xs mt-1">Start typing markdown to see the preview...</p></div></div>';
//     }
//     try {
//       return marked.parse(markdown) as string;
//     } catch {
//       return '<p class="text-red-400 text-sm">Error parsing markdown</p>';
//     }
//   }, [markdown]);

//   // Handle copy button clicks via event delegation
//   const handlePreviewClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
//     const target = e.target as HTMLElement;
//     if (target.classList.contains("code-copy-btn")) {
//       const text = decodeURIComponent(target.getAttribute("data-copy") || "");
//       navigator.clipboard.writeText(text).then(() => {
//         const original = target.textContent;
//         target.textContent = "Copied!";
//         setTimeout(() => {
//           target.textContent = original;
//         }, 1500);
//       }).catch(() => {
//         // Fallback
//         const textarea = document.createElement("textarea");
//         textarea.value = text;
//         document.body.appendChild(textarea);
//         textarea.select();
//         document.execCommand("copy");
//         document.body.removeChild(textarea);
//       });
//     }
//   }, []);

//   return (
//     <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-black dark:shadow-lg dark:shadow-black/30">
//       {/* Preview toolbar/header */}
//       <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800/40 dark:bg-zinc-900/40">
//         {/* Fake window controls */}
//         <div className="flex gap-2">
//           <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/20"></div>
//           <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/20"></div>
//           <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>
//         </div>

//         {/* Preview title */}
//         <div className="flex-1 px-4 text-center">
//           <p className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-300">
//             preview.html
//           </p>
//         </div>

//         {/* Fullscreen toggle */}
//         <button
//           onClick={onToggleFullscreen}
//           title={fullscreen ? "Exit fullscreen" : "Fullscreen preview"}
//           className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-all hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             className="h-3.5 w-3.5"
//           >
//             {fullscreen ? (
//               <>
//                 <polyline points="4 14 10 14 10 20" />
//                 <polyline points="20 10 14 10 14 4" />
//                 <line x1="14" y1="10" x2="21" y2="3" />
//                 <line x1="3" y1="21" x2="10" y2="14" />
//               </>
//             ) : (
//               <>
//                 <polyline points="15 3 21 3 21 9" />
//                 <polyline points="9 21 3 21 3 15" />
//                 <line x1="21" y1="3" x2="14" y2="10" />
//                 <line x1="3" y1="21" x2="10" y2="14" />
//               </>
//             )}
//           </svg>
//         </button>
//       </div>

//       {/* Scrollable preview content area */}
//       <div
//         ref={previewRef}
//         className="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-black"
//       >
//         <div
//           className="preview-content space-y-4 px-6 py-6 text-zinc-900 dark:text-zinc-100"
//           onClick={handlePreviewClick}
//         >
//           <div dangerouslySetInnerHTML={{ __html: html }} className="max-w-none" />
//         </div>
//       </div>

//       {/* Bottom status bar */}
//       <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800/40 dark:bg-zinc-900/40 dark:text-zinc-500">
//         <div className="flex items-center justify-between">
//           <div>HTML Preview</div>
//           <div>UTF-8</div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { marked } from "marked";
import hljs from "highlight.js";

interface PreviewProps {
  markdown: string;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

// Configure marked to use highlight.js for code highlighting
marked.setOptions({
  gfm: true,
  breaks: true,
} as never);

// Custom renderer for code blocks with accessible copy button
const renderer = new marked.Renderer();

renderer.code = ({ text, lang }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";

  let highlighted: string;

  try {
    highlighted = hljs.highlight(text, { language }).value;
  } catch {
    highlighted = hljs.highlightAuto(text).value;
  }

  const safeText = encodeURIComponent(text);

  return `
  <div class="code-block-wrapper relative group my-4 overflow-hidden rounded-lg border border-zinc-700/30 bg-zinc-900/60 shadow-lg">
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

marked.use({ renderer });

// Live HTML preview component for rendered markdown
export default function Preview({
  markdown,
  fullscreen,
  onToggleFullscreen,
}: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse markdown to HTML and memoize
  const html = useMemo(() => {
    if (!mounted) return "";

    if (!markdown.trim()) {
      return `
      <div class="flex flex-col items-center justify-center h-full">
        <div class="text-center">
          <p class="text-zinc-500 text-sm font-medium">No preview</p>
          <p class="text-zinc-600 text-xs mt-1">
            Start typing markdown to see the preview...
          </p>
        </div>
      </div>
      `;
    }

    try {
      return marked.parse(markdown) as string;
    } catch {
      return `
      <p class="text-red-400 text-sm">
        Error parsing markdown
      </p>
      `;
    }
  }, [markdown, mounted]);

  // Handle copy button clicks via event delegation
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
            // Fallback
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
      {/* Preview toolbar/header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800/40 dark:bg-zinc-900/40">
        {/* Fake window controls */}
        <div className="flex gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/20"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/20"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>
        </div>

        {/* Preview title */}
        <div className="flex-1 px-4 text-center">
          <p className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            preview.html
          </p>
        </div>

        {/* Fullscreen toggle */}
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

      {/* Scrollable preview content area */}
      <div
        ref={previewRef}
        className="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-black"
      >
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
      </div>

      {/* Bottom status bar */}
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800/40 dark:bg-zinc-900/40 dark:text-zinc-500">
        <div className="flex items-center justify-between">
          <div>HTML Preview</div>
          <div>UTF-8</div>
        </div>
      </div>
    </div>
  );
}