import re

path = r'C:\Users\SSQ\Desktop\first\markdown-converter\app\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1) Add ShortcutModal import
content = content.replace(
    'import { useKeybindEngine, VimEmacsToggle } from "@/components/KeybindEngine";',
    'import { useKeybindEngine, VimEmacsToggle } from "@/components/KeybindEngine";\nimport ShortcutModal from "@/components/ShortcutModal";'
)

# 2) Add showShortcuts state
content = content.replace(
    'const [shareTooltip, setShareTooltip] = useState(false);',
    'const [shareTooltip, setShareTooltip] = useState(false);\n  const [showShortcuts, setShowShortcuts] = useState(false);'
)

# 3) Add global ? handler after useKeybindEngine block
old_block = '''  // Keybind engine
  useKeybindEngine({
    mode: keybindMode,
    textareaRef: editorRef,
    value: markdown,
    onChange: setMarkdown,
  });

  const syncScroll'''

new_block = '''  // Keybind engine
  useKeybindEngine({
    mode: keybindMode,
    textareaRef: editorRef,
    value: markdown,
    onChange: setMarkdown,
  });

  // Global "?" key opens shortcut reference modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          setShowShortcuts((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const syncScroll'''

content = content.replace(old_block, new_block)

# 4) Add ? button after VimEmacsToggle divider
old_toggle = '<VimEmacsToggle mode={keybindMode} onChange={setKeybindMode} />\n              <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700"> </div>'
new_toggle = old_toggle + '\n              <button\n                onClick={() => setShowShortcuts(true)}\n                title="Keyboard shortcuts (? )"\n                className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"\n              >\n                ?\n              </button>'
content = content.replace(old_toggle, new_toggle)

# 5) Add the ShortcutModal before Footer
content = content.replace(
      '<Footer />',
      '{showShortcuts && <ShortcutModal onClose={() => setShowShortcuts(false)} />}\n      <Footer />'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
