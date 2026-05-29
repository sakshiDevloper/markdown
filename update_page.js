const fs = require("fs");
const path = "C:\\Users\\SSQ\\Desktop\\first\\markdown-converter\\app\\page.tsx";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  'import { useKeybindEngine, VimEmacsToggle } from "@/components/KeybindEngine";',
  'import { useKeybindEngine, VimEmacsToggle } from "@/components/KeybindEngine";\nimport ShortcutModal from "@/components/ShortcutModal";'
);

content = content.replace(
  "const [shareTooltip, setShareTooltip] = useState(false);",
  "const [shareTooltip, setShareTooltip] = useState(false);\n  const [showShortcuts, setShowShortcuts] = useState(false);"
);

const oldBlock = [
  '  // Keybind engine',
  '  useKeybindEngine({',
  '    mode: keybindMode,',
  '    textareaRef: editorRef,',
  '    value: markdown,',
  '    onChange: setMarkdown,',
  '  });',
  '',
  '  const syncScroll'
].join("\n");

const newBlock = [
  '  // Keybind engine',
  '  useKeybindEngine({',
  '    mode: keybindMode,',
  '    textareaRef: editorRef,',
  '    value: markdown,',
  '    onChange: setMarkdown,',
  '  });',
  '',
  '  // Global "?" key opens shortcut reference modal',
  '  useEffect(() => {',
  '    const handler = (e: KeyboardEvent) => {',
  '      if (e.key === "?" && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {',
  '        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();',
  '        if (tag !== "input" && tag !== "textarea") {',
  '          setShowShortcuts((prev) => !prev);',
  '        }',
  '      }',
  '    };',
  '    window.addEventListener("keydown", handler);',
  '    return () => window.removeEventListener("keydown", handler);',
  '  }, []);',
  '',
  '  const syncScroll'
].join("\n");

content = content.replace(oldBlock, newBlock);

const oldToggle = '<VimEmacsToggle mode={keybindMode} onChange={setKeybindMode} />\n              <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700"> </div>';
const newToggle = oldToggle + '\n              <button\n                onClick={() => setShowShortcuts(true)}\n                title="Keyboard shortcuts (?)"\n                className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"\n              >\n                ?\n              </button>';
content = content.replace(oldToggle, newToggle);

content = content.replace(
  '<Footer />',
  '{showShortcuts && <ShortcutModal onClose={() => setShowShortcuts(false)} />}\n      <Footer />'
);

fs.writeFileSync(path, content, "utf-8");
console.log("Done");
