const fs = require("fs");
const path = "C:\\Users\\SSQ\\Desktop\\first\\markdown-converter\\components\\Editor.tsx";
let content = fs.readFileSync(path, "utf-8");

// Add codeblock case to applyShortcut
content = content.replace(
  'case "code": {',
  'case "codeblock": {\n          // Insert fenced code block\n          newValue = value.slice(0, start) + "```\n" + value.slice(start, end) + "\n```" + value.slice(end);\n          newCursorPos = end + 8;\n          break;\n        }\n        case "code": {'
);

// Update the handleKeyDown switch for Ctrl+Shift+`
content = content.replace(
  'case "`":\n          e.preventDefault();\n          applyShortcut("code");\n          break;',
  'case "`":\n          if (e.shiftKey) {\n            e.preventDefault();\n            applyShortcut("codeblock");\n          } else {\n            e.preventDefault();\n            applyShortcut("code");\n          }\n          break;'
);

fs.writeFileSync(path, content, "utf-8");
console.log("Done");
