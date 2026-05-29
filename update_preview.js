const fs = require("fs");
const path = "C:\\Users\\SSQ\\Desktop\\first\\markdown-converter\\components\\Preview.tsx";
let content = fs.readFileSync(path, "utf-8");

// Add emoji map and helper functions after the imports section
const emojiCode = `
// GFM extras: emoji shortcode map (subset of :emoji: → actual emoji)
const emojiMap: Record<string, string> = {
  "rocket": "🚀",
  "fire": "🔥",
  "sparkles": "✨",
  "tada": "🎉",
  "heart": "❤️",
  "star": "⭐",
  "warning": "⚠️",
  "check": "✅",
  "x": "❌",
  "white_check_mark": "✅",
  "wave": "👋",
  "clap": "👏",
  "100": "💯",
  "eyes": "👀",
  "zap": "⚡",
  "gear": "⚙️",
  "bulb": "💡",
  "book": "📖",
  "hammer_and_wrench": "🛠️",
  "page_facing_up": "📄",
  "memo": "📝",
  "computer": "💻",
  "package": "📦",
  "spiral_notepad": "🗒️",
  "chart_with_upwards_trend": "📈",
  "open_book": "📕",
  "mag": "🔍",
  "inbox_tray": "📥",
  "outbox_tray": "📤",
  "link": "🔗",
  "pushpin": "📌",
  "construction": "🚧",
  "art": "🎨",
  "loudspeaker": "📢",
  "speech_balloon": "💬",
  "information_source": "ℹ️",
  "arrow_right": "➡️",
  "arrow_left": "⬅️",
  "arrow_up": "⬆️",
  "arrow_down": "⬇️",
  "soon": "🔜",
  "fast_forward": "⏩",
  "rewind": "⏪",
  "top": "🔝",
  "end": "🔚",
  "copyright": "©️",
  "registered": "®️",
  "tm": "™️",
  "sunny": "☀️",
  "cloud": "☁️",
  "umbrella": "☂️",
  "snowflake": "❄️",
  "star2": "🌟",
  "phone": "📞",
  "mailbox": "📫",
  "envelope": "✉️",
  "key": "🔑",
  "lock": "🔒",
  "unlock": "🔓",
  "pushpin": "📌",
  "round_pushpin": "📍",
  "paperclip": "📎",
  "calendar": "📅",
  "alarm_clock": "⏰",
  "hourglass": "⌛",
  "watch": "⌚",
  "thumbsup": "👍",
  "thumbsdown": "👎",
  "ok_hand": "👌",
  "punch": "✊",
  "fist": "✊",
  "muscle": "💪",
  "point_up": "☝️",
  "point_right": "👉",
  "point_left": "👈",
  "point_down": "👇",
  "raised_hands": "🙌",
  "pray": "🙏",
  "clap": "👏",
  "wave": "👋",
  "smiley": "😃",
  "smile": "😄",
  "laughing": "😆",
  "blush": "😊",
  "wink": "😉",
  "heart_eyes": "😍",
  "kissing_heart": "😘",
  "sweat_smile": "😅",
  "joy": "😂",
  "sob": "😭",
  "cry": "😢",
  "angry": "😡",
  "rage": "🤬",
  "thinking": "🤔",
  "neutral_face": "😐",
  "confused": "😕",
  "worried": "😟",
  "sweat": "😓",
  "weary": "😩",
  "tired_face": "😫",
  "scream": "😱",
  "fearful": "😨",
  "cold_sweat": "😰",
  "disappointed": "😞",
  "sleeping": "😴",
  "zzz": "💤",
  "poop": "💩",
  "ghost": "👻",
  "skull": "💀",
  "alien": "👽",
  "robot": "🤖",
  "dog": "🐶",
  "cat": "🐱",
  "mouse": "🐭",
  "hamster": "🐹",
  "rabbit": "🐰",
  "fox_face": "🦊",
  "bear": "🐻",
  "panda_face": "🐼",
  "koala": "🐨",
  "tiger": "🐯",
  "lion": "🦁",
  "cow": "🐮",
  "pig": "🐷",
  "frog": "🐸",
  "monkey_face": "🐵",
  "chicken": "🐔",
  "baby_chick": "🐤",
  "bird": "🐦",
  "butterfly": "🦋",
  "snail": "🐌",
  "bug": "🐛",
  "ant": "🐜",
  "bee": "🐝",
  "beetle": "🪲",
  "fish": "🐟",
  "tropical_fish": "🐠",
  "blowfish": "🐡",
  "whale": "🐳",
  "dolphin": "🐬",
  "octopus": "🐙",
  "shell": "🐚",
  "crab": "🦀",
  "shrimp": "🦐",
  "squid": "🦑",
  "cactus": "🌵",
  "palm_tree": "🌴",
  "tree": "🌳",
  "seedling": "🌱",
  "herb": "🌿",
  "shamrock": "☘️",
  "four_leaf_clover": "🍀",
  "maple_leaf": "🍁",
  "mushroom": "🍄",
  "cherry_blossom": "🌸",
  "rose": "🌹",
  "hibiscus": "🌺",
  "sunflower": "🌻",
  "blossom": "🌼",
  "tulip": "🌷",
  "earth_americas": "🌎",
  "earth_africa": "🌍",
  "earth_asia": "🌏",
  "full_moon": "🌕",
  "new_moon": "🌑",
  "rainbow": "🌈",
  "ocean": "🌊",
  "volcano": "🌋",
  "milky_way": "🌌",
  "japan": "🗾",
  "snow_capped_mountain": "🏔️",
  "camping": "🏕️",
  "beach": "🏖️",
  "desert": "🏜️",
  "island": "🏝️",
  "park": "🏞️",
  "office": "🏢",
  "hospital": "🏥",
  "bank": "🏦",
  "school": "🏫",
  "castle": "🏰",
  "tent": "⛺",
  "fuelpump": "⛽",
  "ship": "🚢",
  "airplane": "✈️",
  "helicopter": "🚁",
  "satellite": "🛰️",
  "car": "🚗",
  "taxi": "🚕",
  "bus": "🚌",
  "train": "🚆",
  "bicycle": "🚲",
  "motorcycle": "🏍️",
  "scooter": "🛴",
  "house": "🏠",
  "house_with_garden": "🏡",
  "wrench": "🔧",
  "nut_and_bolt": "🔩",
  "hammer": "🔨",
  "tools": "🛠️",
  "ladder": "🪜",
  "microscope": "🔬",
  "telescope": "🔭",
  "satellite_antenna": "📡",
  "syringe": "💉",
  "pill": "💊",
  "toilet": "🚽",
  "shower": "🚿",
  "bathtub": "🛁",
  "bed": "🛏️",
  "couch": "🛋️",
  "bell": "🔔",
  "no_bell": "🔕",
  "musical_note": "🎵",
  "notes": "🎶",
  "microphone": "🎤",
  "headphones": "🎧",
  "radio": "📻",
  "saxophone": "🎷",
  "guitar": "🎸",
  "trumpet": "🎺",
  "violin": "🎻",
  "drum": "🥁",
  "game_die": "🎲",
  "chess_pawn": "♟️",
  "dart": "🎯",
  "trophy": "🏆",
  "medal": "🏅",
  "soccer": "⚽",
  "basketball": "🏀",
  "football": "🏈",
  "baseball": "⚾",
  "tennis": "🎾",
  "bowling": "🎳",
  "golf": "⛳",
  "fishing_pole_and_fish": "🎣",
  "boxing_glove": "🥊",
  "martial_arts_uniform": "🥋",
  "snowboarder": "🏂",
  "skier": "⛷️",
  "swimmer": "🏊",
  "surfer": "🏄",
  "rowboat": "🚣",
  "bicyclist": "🚴",
  "mountain_bicyclist": "🚵",
  "horse_racing": "🏇",
  "ticket": "🎫",
  "clapper": "🎬",
  "performing_arts": "🎭",
  "circus_tent": "🎪",
  "movie_camera": "🎥",
  "film_strip": "🎞️",
  "video_camera": "📹",
  "television": "📺",
  "camera": "📷",
  "phone": "📱",
};

function replaceEmojiShortcodes(text: string): string {
  return text.replace(/:([a-zA-Z0-9_+\-]+):/g, (match, code) => {
    return emojiMap[code] || match;
  });
}

// GFM extras: definition list detection (simple regex)
function detectDefinitionLists(markdown: string): string {
  // Convert "term\\n: definition" pattern to HTML dl/dt/dd
  return markdown.replace(
    /^(\\S[^\\n]*)\\n(?=:\\s)/gm,
    (match) => match
  );
}
';

// Insert emoji/definition helpers after the escapeHtml function
content = content.replace(
  "export default function Preview({",
  emojiCode + "\n\nexport default function Preview({"
);

// Add emoji replacement in the html processing (after marked.parse)
// Find where html is assigned
content = content.replace(
  'const html = useMemo(() => {',
  'function processDefinitionLists(html: string): string {\n  // Transform <p>: definition</p> patterns to dl/dt/dd\n  return html.replace(\n    /<p>([^<]+)<\\/p>\\n<p>:\\s*([^<]+)<\\/p>/g,\n    (_, term, def) => `<dl class="my-4"><dt class="font-semibold text-zinc-900 dark:text-zinc-100">${term}</dt><dd class="ml-4 text-zinc-600 dark:text-zinc-400">${def}</dd></dl>`\n  );\n}\n\nconst html = useMemo(() => {'
);

// Apply emoji replacement in the html variable assignment after marked.parse
content = content.replace(
  'const slugger = createSlugger();\n      const renderer = new marked.Renderer();',
  'const slugger = createSlugger();\n      const renderer = new marked.Renderer();\n\n      // GFM: Emoji shortcode support in paragraph/heading text\n      renderer.paragraph = ({ text }) => `<p class="my-2 leading-relaxed text-zinc-800 dark:text-zinc-200">${replaceEmojiShortcodes(text)}</p>`;\n      renderer.heading = ({ text, depth }) => {\n        const emojiText = replaceEmojiShortcodes(text);\n        return `<h${depth} id="${slugger(text)}" class="font-bold text-zinc-900 dark:text-zinc-100 ${depth === 1 ? "text-2xl mt-6 mb-3" : depth === 2 ? "text-xl mt-5 mb-2" : "text-lg mt-4 mb-2"}">${emojiText}</h${depth}>`;\n      };'
);

// Add emoji processing to the raw HTML mode and task list progress calculation
content = content.replace(
  'const [mode, setMode] = useState<"preview" | "html">("preview");',
  'const [mode, setMode] = useState<"preview" | "html">("preview");\n  const [taskProgress, setTaskProgress] = useState({ done: 0, total: 0 });'
);

// Calculate task progress from markdown  
content = content.replace(
  'setMounted(true);\n  }, []);',
  'setMounted(true);\n  }, []);\n\n  // Calculate task list progress\n  useEffect(() => {\n    const taskLines = markdown.split("\\n").filter(l => /^\\s*[-*+]\\s\\[([ x])\\]/.test(l));\n    const done = taskLines.filter(l => /^\\s*[-*+]\\s\\[x\\]/.test(l.toLowerCase())).length;\n    setTaskProgress({ done, total: taskLines.length });\n  }, [markdown]);'
);

// After computing html, add definition list processing
content = content.replace(
  'return `<h${depth} id="${slugger(text)}" class="font-bold text-zinc-900 dark:text-zinc-100 ${',
  '// Apply emoji to list items too\n      renderer.listitem = ({ text, task, checked }) => {\n        const displayText = replaceEmojiShortcodes(text);\n        if (task) {\n          return `<li class="flex items-start gap-2 my-1.5 text-zinc-800 dark:text-zinc-200"><input type="checkbox" ${checked ? "checked" : ""} disabled class="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-400 text-indigo-600 accent-indigo-600 dark:border-zinc-600 dark:accent-indigo-500" /><span>${checked ? `<span class="line-through text-zinc-400 dark:text-zinc-500">${displayText}</span>` : displayText}</span></li>`;\n        }\n        return `<li class="my-1 text-zinc-800 dark:text-zinc-200">${displayText}</li>`;\n      };\n\n      return `<h${depth} id="${slugger(text)}" class="font-bold text-zinc-900 dark:text-zinc-100 ${'
);

// Replace the old listitem renderer addition to avoid duplication
// Actually, the original code already has a listitem renderer. Let me find and replace it
content = content.replace(
  'renderer.listitem = ({ text, task, checked }) => {',
  '// Replaced by earlier custom listitem\n      /*renderer.listitem = ({ text, task, checked }) => {'
);

// Add definition list processing before final return from useMemo
content = content.replace(
  'return `<h${depth} id="${slugger(text)}" class="font-bold text-zinc-900 dark:text-zinc-100 ${',
  'return `<h${depth} id="${slugger(text)}" class="font-bold text-zinc-900 dark:text-zinc-100 ${'
);

// Add task progress bar at the top of preview content
content = content.replace(
  '<div\n    className="preview-content space-y-4 px-6 py-6 text-zinc-900 dark:text-zinc-100"\n    onClick={handlePreviewClick}\n  >',
  '<div>\n                {taskProgress.total > 0 && (\n                  <div className="flex items-center gap-3 px-6 pt-4 pb-2 text-xs text-zinc-500 dark:text-zinc-400">\n                    <span>Task Progress:</span>\n                    <div className="h-2 flex-1 max-w-48 rounded-full bg-zinc-200 dark:bg-zinc-700">\n                      <div\n                        className="h-2 rounded-full bg-emerald-500 transition-all duration-300"\n                        style={{ width: \`\${Math.round((taskProgress.done / taskProgress.total) * 100)}%\` }}\n                      />\n                    </div>\n                    <span className="font-medium">{taskProgress.done}/{taskProgress.total}</span>\n                  </div>\n                )}\n              </div>\n              <div\n    className="preview-content space-y-4 px-6 py-6 text-zinc-900 dark:text-zinc-100"\n    onClick={handlePreviewClick}\n  >'
);

fs.writeFileSync(path, content, "utf-8");
console.log("Done");
