"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FiSearch, FiX, FiChevronUp, FiChevronDown } from "react-icons/fi";

interface FindReplaceProps {
  text: string;
  onReplace: (find: string, replace: string) => string;
  onClose: () => void;
}

export default function FindReplace({ text, onReplace, onClose }: FindReplaceProps) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findInputRef.current?.focus();
  }, []);

  const countMatches = useCallback(
    (findText: string) => {
      if (!findText) {
        setMatchCount(0);
        setCurrentMatch(0);
        return;
      }
      const flags = caseSensitive ? "g" : "gi";
      const regex = new RegExp(escapeRegex(findText), flags);
      const matches = text.match(regex);
      setMatchCount(matches ? matches.length : 0);
      setCurrentMatch(matches ? 1 : 0);
    },
    [text, caseSensitive]
  );

  useEffect(() => {
    countMatches(find);
  }, [find, countMatches]);

  const handleFindChange = useCallback(
    (value: string) => {
      setFind(value);
    },
    []
  );

  const handleReplace = useCallback(() => {
    if (!find) return;
    const result = onReplace(find, replace);
    // The parent will update the text
    countMatches(find);
  }, [find, replace, onReplace, countMatches]);

  const handleReplaceAll = useCallback(() => {
    if (!find) return;
    // Call onReplace repeatedly until no more matches
    let current = text;
    let prev = "";
    while (prev !== current) {
      prev = current;
      current = onReplace(find, replace);
    }
    // Force parent update via a single call with the final result
    onReplace(find, replace);
    countMatches(find);
  }, [find, replace, text, onReplace, countMatches]);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            ref={findInputRef}
            value={find}
            onChange={(e) => handleFindChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
              if (e.key === "Escape") onClose();
            }}
            placeholder="Find..."
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500"
          />
        </div>
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          title="Case sensitive"
          className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-all ${
            caseSensitive
              ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400"
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          Aa
        </button>
        <button
          onClick={onClose}
          title="Close"
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleReplace();
            if (e.key === "Escape") onClose();
          }}
          placeholder="Replace..."
          className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 py-1.5 px-2.5 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500"
        />
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
          {find ? `${currentMatch}/${matchCount}` : ""}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleReplace}
          disabled={!find || matchCount === 0}
          className="rounded-md bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Replace
        </button>
        <button
          onClick={handleReplaceAll}
          disabled={!find || matchCount === 0}
          className="rounded-md border border-zinc-300 px-3 py-1 text-[11px] font-medium text-zinc-700 transition-all hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Replace All
        </button>
      </div>
    </div>
  );
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
