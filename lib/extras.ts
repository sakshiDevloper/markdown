// GFM extras: emoji shortcodes, footnotes, definition lists, task progress

// Emoji shortcode map (comprehensive subset)
export const emojiMap: Record<string, string> = {
  "rocket": "🚀", "fire": "🔥", "sparkles": "✨", "tada": "🎉",
  "heart": "❤️", "star": "⭐", "warning": "⚠️", "check": "✅",
  "x": "❌", "white_check_mark": "✅", "wave": "👋", "clap": "👏",
  "100": "💯", "eyes": "👀", "zap": "⚡", "gear": "⚙️",
  "bulb": "💡", "book": "📖", "memo": "📝", "computer": "💻",
  "package": "📦", "link": "🔗", "pushpin": "📌", "construction": "🚧",
  "art": "🎨", "loudspeaker": "📢", "speech_balloon": "💬",
  "information_source": "ℹ️", "arrow_right": "➡️", "arrow_left": "⬅️",
  "arrow_up": "⬆️", "arrow_down": "⬇️", "soon": "🔜",
  "fast_forward": "⏩", "rewind": "⏪", "copyright": "©️",
  "registered": "®️", "tm": "™️", "sunny": "☀️", "cloud": "☁️",
  "snowflake": "❄️", "star2": "🌟", "phone": "📞", "envelope": "✉️",
  "key": "🔑", "lock": "🔒", "unlock": "🔓", "calendar": "📅",
  "alarm_clock": "⏰", "hourglass": "⌛", "watch": "⌚",
  "thumbsup": "👍", "thumbsdown": "👎", "ok_hand": "👌",
  "punch": "✊", "muscle": "💪", "raised_hands": "🙌", "pray": "🙏",
  "smile": "😄", "laughing": "😆", "blush": "😊", "wink": "😉",
  "heart_eyes": "😍", "joy": "😂", "sob": "😭", "thinking": "🤔",
  "neutral_face": "😐", "sweat": "😓", "scream": "😱",
  "sleeping": "😴", "zzz": "💤", "poop": "💩", "ghost": "👻",
  "robot": "🤖", "dog": "🐶", "cat": "🐱", "fox_face": "🦊",
  "bear": "🐻", "panda_face": "🐼", "lion": "🦁", "frog": "🐸",
  "cactus": "🌵", "palm_tree": "🌴", "cherry_blossom": "🌸",
  "rose": "🌹", "sunflower": "🌻", "tulip": "🌷",
  "earth_americas": "🌎", "rainbow": "🌈", "ocean": "🌊",
  "car": "🚗", "airplane": "✈️", "bicycle": "🚲",
  "house": "🏠", "trophy": "🏆", "medal": "🏅", "soccer": "⚽",
  "basketball": "🏀", "tennis": "🎾", "dart": "🎯",
  "musical_note": "🎵", "notes": "🎶", "microphone": "🎤",
  "headphones": "🎧", "camera": "📷", "movie_camera": "🎥",
  "television": "📺",  "satellite": "🛰️",
};

export function replaceEmojiShortcodes(text: string): string {
  return text.replace(/:([a-zA-Z0-9_+\-]+):/g, (match, code) => {
    return emojiMap[code] || match;
  });
}

export function calculateTaskProgress(markdown: string): { done: number; total: number } {
  const lines = markdown.split("\n");
  const taskLines = lines.filter(l => /^\s*[-*+]\s\[([ x])\]/i.test(l));
  const done = taskLines.filter(l => /^\s*[-*+]\s\[x\]/i.test(l.toLowerCase())).length;
  return { done, total: taskLines.length };
}
