"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

interface KeybindEngineProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Keybinding engine for the markdown editor.
 */
export function useKeybindEngine({}: KeybindEngineProps) {
  // Placeholder for future keybinding support
  // Currently only normal mode is supported
}


