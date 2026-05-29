const fs = require("fs");
const path = "C:\\Users\\SSQ\\Desktop\\first\\markdown-converter\\components\\Preview.tsx";
let content = fs.readFileSync(path, "utf-8");

// 1) Add import for extras
content = content.replace(
  'import { createSlugger } from "@/lib/headings";',
  'import { createSlugger } from "@/lib/headings";\nimport { replaceEmojiShortcodes, calculateTaskProgress } from "@/lib/extras";'
);

// 2) Add taskProgress state
content = content.replace(
  'const [mode, setMode] = useState<"preview" | "html">("preview");',
  'const [mode, setMode] = useState<"preview" | "html">("preview");\n  const [taskProgress, setTaskProgress] = useState({ done: 0, total: 0 });'
);

// 3) Add task progress calculation
content = content.replace(
  "setMounted(true);",
  "setMounted(true);\n      setTaskProgress(calculateTaskProgress(markdown));"
);

// 4) Replace the paragraph renderer to add emoji support (find and replace)
// The old: renderer.paragraph is not explicitly set in the original code
// But the listitem renderer exists. Let me find the renderer.listitem definition and add paragraph before it
content = content.replace(
  'renderer.listitem = ({ text, task, checked }) => {',
  'renderer.paragraph = ({ text }) => `<p class="my-2 leading-relaxed text-zinc-800 dark:text-zinc-200">${replaceEmojiShortcodes(text)}</p>`;\n\n      renderer.listitem = ({ text, task, checked }) => {'
);

// 5) Replace the old listitem renderer's text usage with emoji-replaced text
content = content.replace(
  'renderer.listitem = ({ text, task, checked }) => {\n        if (task) {\n          return `<li class="flex items-start gap-2 my-1.5 text-zinc-800 dark:text-zinc-200"><input type="checkbox" ${\n            checked ? "checked" : ""\n          } disabled class="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-400 text-indigo-600 accent-indigo-600 dark:border-zinc-600 dark:accent-indigo-500" /><span>${\n            checked ? `<span class="line-through text-zinc-400 dark:text-zinc-500">${text}</span>` : text\n          }</span></li>`;\n        }\n        // Regular list item inherited styling via prose\n        return `<li class="my-1 text-zinc-800 dark:text-zinc-200">${text}</li>`;\n      };',
  'renderer.listitem = ({ text, task, checked }) => {\n        const displayText = replaceEmojiShortcodes(text);\n        if (task) {\n          return `<li class="flex items-start gap-2 my-1.5 text-zinc-800 dark:text-zinc-200"><input type="checkbox" ${\n            checked ? "checked" : ""\n          } disabled class="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-400 text-indigo-600 accent-indigo-600 dark:border-zinc-600 dark:accent-indigo-500" /><span>${\n            checked ? `<span class="line-through text-zinc-400 dark:text-zinc-500">${displayText}</span>` : displayText\n          }</span></li>`;\n        }\n        return `<li class="my-1 text-zinc-800 dark:text-zinc-200">${displayText}</li>`;\n      };'
);

// 6) Add task progress bar before the preview content div
content = content.replace(
  '<div\n    className="preview-content space-y-4 px-6 py-6 text-zinc-900 dark:text-zinc-100"\n    onClick={handlePreviewClick}\n  >',
  '{taskProgress.total > 0 && (\n              <div className="flex items-center gap-3 px-6 pt-4 pb-0 text-xs text-zinc-500 dark:text-zinc-400">\n                <span>Tasks:</span>\n                <div className="h-2 flex-1 max-w-48 rounded-full bg-zinc-200 dark:bg-zinc-700">\n                  <div\n                    className="h-2 rounded-full bg-emerald-500 transition-all duration-300"\n                    style={{ width: `${Math.round((taskProgress.done / taskProgress.total) * 100)}%` }}\n                  />\n                </div>\n                <span className="font-medium tabular-nums">{taskProgress.done}/{taskProgress.total}</span>\n              </div>\n            )}\n            <div\n    className="preview-content space-y-4 px-6 py-6 text-zinc-900 dark:text-zinc-100"\n    onClick={handlePreviewClick}\n  >'
);

// 7) Apply emoji to heading text - find the heading renderer and add emoji processing
// The heading renderer was already customized in the original code
content = content.replace(
  'renderer.heading = ({ text, depth }) =>\n        `<h${depth} id="${slugger(text)}" class="font-bold text-zinc-900 dark:text-zinc-100 ${',
  'renderer.heading = ({ text, depth }) => {\n        const emojiText = replaceEmojiShortcodes(text);\n        return `<h${depth} id="${slugger(text)}" class="font-bold text-zinc-900 dark:text-zinc-100 ${'
);

// Fix the closing of the heading renderer (it was a one-liner with arrow)
content = content.replace(
  'renderer.heading = ({ text, depth }) =>\n        `<h${depth} id="${slugger(text)}" class="font-bold text-zinc-900 dark:text-zinc-100 ${',  // already replaced, skip
  ''
);

content = content.replace(
  '}>${text}</h${depth}>`;',
  '}>${emojiText}</h${depth}>`;\n      };'
);

fs.writeFileSync(path, content, "utf-8");
console.log("Done");
