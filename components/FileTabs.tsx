"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FiPlus, FiX } from "react-icons/fi";

export interface FileTab {
  id: string;
  name: string;
  content: string;
}

interface FileTabsProps {
  files: FileTab[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onAddFile: () => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, name: string) => void;
}

export default function FileTabs({
  files,
  activeFileId,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onRenameFile,
}: FileTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleDoubleClick = useCallback((id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  }, []);

  const handleRenameSubmit = useCallback(
    (id: string) => {
      const trimmed = editValue.trim();
      if (trimmed) {
        // Ensure .md extension
        const finalName = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
        onRenameFile(id, finalName);
      }
      setEditingId(null);
    },
    [editValue, onRenameFile]
  );

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-b border-zinc-200 bg-zinc-100/50 px-2 dark:border-zinc-800/40 dark:bg-zinc-900/30">
      {files.map((file) => (
        <div
          key={file.id}
          className={`group flex shrink-0 items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer select-none ${
            file.id === activeFileId
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100"
              : "text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
          }`}
          onClick={() => onSelectFile(file.id)}
          onDoubleClick={() => handleDoubleClick(file.id, file.name)}
        >
          {editingId === file.id ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleRenameSubmit(file.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(file.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              className="w-20 rounded border border-zinc-300 bg-white px-1 py-0.5 text-xs outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate max-w-28">{file.name}</span>
          )}

          {files.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(file.id);
              }}
              title="Close file"
              className="flex h-4 w-4 items-center justify-center rounded text-zinc-400 opacity-0 transition-all hover:bg-zinc-300 hover:text-zinc-600 group-hover:opacity-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
            >
              <FiX className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}

      <button
        onClick={onAddFile}
        title="New file"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-400 transition-all hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <FiPlus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
