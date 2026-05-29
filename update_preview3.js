const fs = require("fs");
const path = "C:\\Users\\SSQ\\Desktop\\first\\markdown-converter\\components\\Preview.tsx";
let c = fs.readFileSync(path, "utf-8");

// Add import
c = c.replace(
  'import { createSlugger } from "@/lib/headings";',
  'import { createSlugger } from "@/lib/headings";\nimport { replaceEmojiShortcodes, calculateTaskProgress } from "@/lib/extras";'
);

// Add taskProgress state  
c = c.replace(
  'const [mode, setMode] = useState<"preview" | "html">("preview");',
  'const [mode, setMode] = useState<"preview" | "html">("preview");\n  const [taskProgress, setTaskProgress] = useState({ done: 0, total: 0 });'
);

// Add emoji support to heading renderer 
c = c.replace(
  "renderer.heading = ({ text, depth }) =>",
  "renderer.heading = ({ text, depth }) => {\n        const emojiText = replaceEmojiShortcodes(text);\n        return"
);

c = c.replace(
  "}>${text}</h${depth}>`;",
  "}>${emojiText}</h${depth}>`;\n      };"
);

// Add paragraph renderer with emoji support before code renderer
c = c.replace(
  "renderer.code = ({ text, lang }) => {",
  "renderer.paragraph = ({ text }) => `<p class=\"my-2 leading-relaxed text-zinc-800 dark:text-zinc-200\">${replaceEmojiShortcodes(text)}</p>`;\n\n      renderer.code = ({ text, lang }) => {"
);

// Replace listitem renderer to use emoji
const oldListItem = `renderer.listitem = ({ text, task, checked }) => {
        if (task) {
          return \`<li class="flex items-start gap-2 my-1.5 text-zinc-800 dark:text-zinc-200"><input type="checkbox" \${checked ? "checked" : ""} disabled class="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-400 text-indigo-600 accent-indigo-600 dark:border-zinc-600 dark:accent-indigo-500" /><span>\${
            checked ? \`<span class="line-through text-zinc-400 dark:text-zinc-500">\${text}</span>\` : text
          }</span></li>\`;
        }
        // Regular list item inherited styling via prose
        return \`<li class="my-1 text-zinc-800 dark:text-zinc-200">\${text}</li>\`;
      };`;

const newListItem = `renderer.listitem = ({ text, task, checked }) => {
        const displayText = replaceEmojiShortcodes(text);
        if (task) {
          return \`<li class="flex items-start gap-2 my-1.5 text-zinc-800 dark:text-zinc-200"><input type="checkbox" \${checked ? "checked" : ""} disabled class="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-400 text-indigo-600 accent-indigo-600 dark:border-zinc-600 dark:accent-indigo-500" /><span>\${
            checked ? \`<span class="line-through text-zinc-400 dark:text-zinc-500">\${displayText}</span>\` : displayText
          }</span></li>\`;
        }
        return \`<li class="my-1 text-zinc-800 dark:text-zinc-200">\${displayText}</li>\`;
      };`;

c = c.replace(oldListItem, newListItem);

// Add emoji to setMounted and task progress
c = c.replace(
  "setMounted(true);",
  "setMounted(true);\n      setTaskProgress(calculateTaskProgress(markdown));"
);

fs.writeFileSync(path, c, "utf-8");
console.log("Done");
