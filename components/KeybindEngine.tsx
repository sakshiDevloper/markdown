"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

type KeybindMode = "normal" | "vim" | "emacs";

interface KeybindEngineProps {
  mode: KeybindMode;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Lightweight Vim/Emacs keybinding engine for the markdown editor.
 */
export function useKeybindEngine({
  mode,
  textareaRef,
  value,
  onChange,
}: KeybindEngineProps) {
  const modeRef = useRef(mode);
  const valueRef = useRef(value);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Use rAF loop to wait for ref to become available
  useEffect(() => {
    if (mode === "normal") return;

    let ta: HTMLTextAreaElement | null = null;
    let cancelled = false;

    const handler = (e: KeyboardEvent) => {
      if (!ta) return;
      const currentMode = modeRef.current;
      const currentValue = valueRef.current;
      if (currentMode === "vim") {
        handleVimKey(e, ta, currentValue, onChange);
      } else if (currentMode === "emacs") {
        handleEmacsKey(e, ta, currentValue, onChange);
      }
    };

    // Keep trying until ref is populated
    const tryAttach = () => {
      if (cancelled) return;
      const el = textareaRef.current;
      if (el) {
        ta = el;
        el.addEventListener("keydown", handler);
      } else {
        requestAnimationFrame(tryAttach);
      }
    };
    requestAnimationFrame(tryAttach);

    return () => {
      cancelled = true;
      if (ta) {
        ta.removeEventListener("keydown", handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, onChange]);
}

function handleVimKey(
  e: KeyboardEvent,
  ta: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
) {
  const ctrl = e.ctrlKey;
  if (!ctrl) return;

  switch (e.key.toLowerCase()) {
    case "p": {
      // Ctrl+P: Move cursor up (like k)
      e.preventDefault();
      moveLine(ta, -1);
      break;
    }
    case "n": {
      // Ctrl+N: Move cursor down (like j)
      e.preventDefault();
      moveLine(ta, 1);
      break;
    }
    case "f": {
      // Ctrl+F: Page down
      e.preventDefault();
      pageScroll(ta, 1);
      break;
    }
    case "b": {
      // Ctrl+B: Page up
      e.preventDefault();
      pageScroll(ta, -1);
      break;
    }
    case "d": {
      // Ctrl+D: Half page down
      e.preventDefault();
      halfPageScroll(ta, 1);
      break;
    }
    case "u": {
      // Ctrl+U: Half page up
      e.preventDefault();
      halfPageScroll(ta, -1);
      break;
    }
    case "a": {
      // Ctrl+A: Go to line start (after indent)
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", ta.selectionStart - 1) + 1;
      const textAfter = value.slice(lineStart);
      const firstNonSpace = textAfter.search(/\S/);
      ta.selectionStart = ta.selectionEnd =
        firstNonSpace >= 0 ? lineStart + firstNonSpace : lineStart;
      break;
    }
    case "e": {
      // Ctrl+E: Go to end of line
      e.preventDefault();
      const lineEnd = value.indexOf("\n", ta.selectionStart);
      ta.selectionStart = ta.selectionEnd =
        lineEnd >= 0 ? lineEnd : value.length;
      break;
    }
    case "x": {
      // Ctrl+X: Delete character under cursor
      e.preventDefault();
      if (ta.selectionStart === ta.selectionEnd && ta.selectionStart < value.length) {
        const newValue = value.slice(0, ta.selectionStart) + value.slice(ta.selectionStart + 1);
        onChange(newValue);
      }
      break;
    }
  }
}

function handleEmacsKey(
  e: KeyboardEvent,
  ta: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
) {
  const ctrl = e.ctrlKey;
  if (!ctrl) return;

  switch (e.key.toLowerCase()) {
    case "b": {
      // Ctrl+B: Backward char
      e.preventDefault();
      ta.selectionStart = ta.selectionEnd = Math.max(0, ta.selectionStart - 1);
      break;
    }
    case "f": {
      // Ctrl+F: Forward char
      e.preventDefault();
      ta.selectionStart = ta.selectionEnd = Math.min(value.length, ta.selectionStart + 1);
      break;
    }
    case "p": {
      // Ctrl+P: Previous line
      e.preventDefault();
      moveLine(ta, -1);
      break;
    }
    case "n": {
      // Ctrl+N: Next line
      e.preventDefault();
      moveLine(ta, 1);
      break;
    }
    case "a": {
      // Ctrl+A: Beginning of line
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", ta.selectionStart - 1) + 1;
      ta.selectionStart = ta.selectionEnd = lineStart;
      break;
    }
    case "e": {
      // Ctrl+E: End of line
      e.preventDefault();
      const lineEnd = value.indexOf("\n", ta.selectionStart);
      ta.selectionStart = ta.selectionEnd = lineEnd >= 0 ? lineEnd : value.length;
      break;
    }
    case "d": {
      // Ctrl+D: Delete char forward
      e.preventDefault();
      if (ta.selectionStart === ta.selectionEnd && ta.selectionStart < value.length) {
        const newValue = value.slice(0, ta.selectionStart) + value.slice(ta.selectionStart + 1);
        onChange(newValue);
      }
      break;
    }
    case "k": {
      // Ctrl+K: Kill to end of line
      e.preventDefault();
      const lineEnd = value.indexOf("\n", ta.selectionStart);
      const endPos = lineEnd >= 0 ? lineEnd : value.length;
      const newValue = value.slice(0, ta.selectionStart) + value.slice(endPos);
      onChange(newValue);
      break;
    }
    case "y": {
      // Ctrl+Y: Yank (paste) — not implemented fully, just paste
      e.preventDefault();
      break;
    }
    case " ": {
      // Ctrl+Space: Set mark (not stored, skip)
      e.preventDefault();
      break;
    }
    case "w": {
      // Ctrl+W: Forward word
      e.preventDefault();
      moveWordForward(ta, value);
      break;
    }
    case "h": {
      // Don't intercept Ctrl+H (our find/replace)
      if (!e.shiftKey) return;
      break;
    }
  }
}

function moveLine(ta: HTMLTextAreaElement, direction: -1 | 1) {
  const current = ta.selectionStart;
  const text = ta.value;
  const prevNewline = text.lastIndexOf("\n", current - 1);
  const nextNewline = text.indexOf("\n", current);

  if (direction === -1) {
    if (prevNewline < 0) {
      ta.selectionStart = ta.selectionEnd = 0;
      return;
    }
    const prevPrevNewline = text.lastIndexOf("\n", prevNewline - 1);
    const targetLineStart = prevPrevNewline + 1;
    const currentCol = current - prevNewline - 1;
    const targetLine = text.slice(targetLineStart, prevNewline);
    const clampedCol = Math.min(currentCol, targetLine.length);
    ta.selectionStart = ta.selectionEnd = targetLineStart + clampedCol;
  } else {
    if (nextNewline < 0) {
      ta.selectionStart = ta.selectionEnd = text.length;
      return;
    }
    const nextNextNewline = text.indexOf("\n", nextNewline + 1);
    const targetLineStart = nextNewline + 1;
    const targetLineEnd = nextNextNewline >= 0 ? nextNextNewline : text.length;
    const currentCol = current - prevNewline - 1;
    const targetLine = text.slice(targetLineStart, targetLineEnd);
    const clampedCol = Math.min(currentCol, targetLine.length);
    ta.selectionStart = ta.selectionEnd = targetLineStart + clampedCol;
  }
}

function pageScroll(ta: HTMLTextAreaElement, direction: -1 | 1) {
  const lineHeight = 20;
  const delta = direction * Math.floor(ta.clientHeight / lineHeight) * lineHeight;
  ta.scrollTop = Math.max(0, ta.scrollTop + delta);
}

function halfPageScroll(ta: HTMLTextAreaElement, direction: -1 | 1) {
  const lineHeight = 20;
  const delta = direction * Math.floor(ta.clientHeight / lineHeight / 2) * lineHeight;
  ta.scrollTop = Math.max(0, ta.scrollTop + delta);
}

function moveWordForward(ta: HTMLTextAreaElement, text: string) {
  const pos = ta.selectionStart;
  const match = text.slice(pos).match(/\S+\s*/);
  if (match) {
    ta.selectionStart = ta.selectionEnd = pos + match[0].length;
  }
}

export function VimEmacsToggle({
  mode,
  onChange,
}: {
  mode: KeybindMode;
  onChange: (mode: KeybindMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-zinc-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
      {(["normal", "vim", "emacs"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
            mode === m
              ? "bg-indigo-100 text-indigo-700 shadow-sm dark:bg-indigo-600/20 dark:text-indigo-300"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          {m === "normal" ? "Normal" : m === "vim" ? "Vim" : "Emacs"}
        </button>
      ))}
    </div>
  );
}