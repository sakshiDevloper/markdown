"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiMonitor, FiMaximize2 } from "react-icons/fi";
import { marked } from "marked";
import hljs from "highlight.js";
import { createSlugger } from "@/lib/headings";

interface PresentationModeProps {
  markdown: string;
  onClose: () => void;
}

export default function PresentationMode({ markdown, onClose }: PresentationModeProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [slides, setSlides] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Split markdown into slides by headings (h1/h2)
  useEffect(() => {
    if (!markdown.trim()) {
      setSlides(["<p class='text-center text-zinc-500'>No content</p>"]);
      return;
    }

    // Split by headings — each heading starts a new slide
    const parts = markdown.split(/\n(?=#+\s)/);
    if (parts.length <= 1) {
      // If no headings, wrap entire content as one slide
      const slugger = createSlugger();
      const renderer = createSlideRenderer(slugger);
      try {
        const html = marked.parse(markdown, { renderer, gfm: true, breaks: true }) as string;
        setSlides([html]);
      } catch {
        setSlides(["<p class='text-center text-red-400'>Error parsing markdown</p>"]);
      }
      return;
    }

    const slugger = createSlugger();
    const renderer = createSlideRenderer(slugger);

    const rendered = parts.map((part) => {
      try {
        return marked.parse(part, { renderer, gfm: true, breaks: true }) as string;
      } catch {
        return "<p>Error</p>";
      }
    });
    setSlides(rendered);
  }, [markdown]);

  const goNext = useCallback(() => {
    setSlideIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setSlideIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Home") {
        setSlideIndex(0);
      } else if (e.key === "End") {
        setSlideIndex(slides.length - 1);
      }
    },
    [goNext, goPrev, onClose, slides.length],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Preparing slides...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width * 0.3) goPrev();
        else if (x > rect.width * 0.7) goNext();
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 text-zinc-400">
        <span className="text-sm font-medium">
          {slideIndex + 1} / {slides.length}
        </span>
        <span className="text-xs text-zinc-600">Arrow keys or click edges to navigate</span>
        <button
          onClick={onClose}
          title="Exit (Esc)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {/* Slide content */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-12 py-8">
        <div
          className="prose-custom prose-invert w-full max-w-4xl animate-fadeIn text-zinc-100"
          dangerouslySetInnerHTML={{ __html: slides[slideIndex] }}
        />
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={goPrev}
          disabled={slideIndex === 0}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {/* Slide indicator dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === slideIndex ? "w-6 bg-white" : "w-2 bg-zinc-700 hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={slideIndex === slides.length - 1}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function createSlideRenderer(slugger: ReturnType<typeof createSlugger>) {
  const renderer = new marked.Renderer();

  renderer.heading = ({ text, depth }) => {
    const id = slugger(text);
    // Scale headings for slides
    const sizes: Record<number, string> = {
      1: "text-5xl font-bold mb-4",
      2: "text-4xl font-bold mb-3",
      3: "text-3xl font-semibold mb-2",
      4: "text-2xl font-semibold mb-2",
      5: "text-xl font-medium mb-1",
      6: "text-lg font-medium mb-1",
    };
    return `<h${depth} id="${id}" class="${sizes[depth] || "text-lg"} text-zinc-100">${text}</h${depth}>`;
  };

  renderer.code = ({ text, lang }) => {
    const normalized = (lang ?? "").trim().toLowerCase();
    let highlighted: string;
    try {
      const language = normalized && hljs.getLanguage(normalized) ? normalized : "plaintext";
      highlighted = hljs.highlight(text, { language }).value;
    } catch {
      highlighted = hljs.highlightAuto(text).value;
    }
    return `<pre class="overflow-x-auto rounded-lg bg-zinc-900 p-4 my-4 text-sm"><code class="hljs">${highlighted}</code></pre>`;
  };

  renderer.image = ({ href, title, text }) => {
    return `<img src="${href}" alt="${text}" title="${title || ""}" class="max-w-full rounded-lg my-4 mx-auto" />`;
  };

  renderer.table = ({ header, rows }) => {
    return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse"><thead><tr>${header
      .map((cell) => `<th class="border border-zinc-700 px-3 py-2 text-left text-sm font-semibold text-zinc-200 bg-zinc-800">${cell.text}</th>`)
      .join("")}</tr></thead><tbody>${rows
      .map(
        (row) =>
          `<tr>${row
            .map(
              (cell) =>
                `<td class="border border-zinc-700 px-3 py-2 text-sm text-zinc-300">${cell.text}</td>`,
            )
            .join("")}</tr>`,
      )
      .join("")}</tbody></table></div>`;
  };

  renderer.listitem = ({ text, task, checked }) => {
    if (task) {
      return `<li class="flex items-center gap-2 text-zinc-300 my-1"><input type="checkbox" ${
        checked ? "checked" : ""
      } disabled class="h-4 w-4 rounded border-zinc-600 accent-zinc-100" /><span>${
        checked ? `<span class="line-through text-zinc-500">${text}</span>` : text
      }</span></li>`;
    }
    return `<li class="text-zinc-300 my-1">${text}</li>`;
  };

  renderer.paragraph = ({ text }) => `<p class="text-zinc-300 my-2 leading-relaxed text-lg">${text}</p>`;

  renderer.blockquote = ({ text }) =>
    `<blockquote class="border-l-4 border-zinc-500 pl-4 my-4 text-zinc-400 italic">${text}</blockquote>`;

  renderer.hr = () => `<hr class="my-6 border-zinc-800" />`;

  return renderer;
}