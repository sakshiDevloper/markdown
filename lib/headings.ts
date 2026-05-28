export interface TocHeading {
  id: string;
  text: string;
  depth: number;
}

const NON_WORD_OR_SPACE = /[^\w\s-]/g;
const WHITESPACE = /\s+/g;

export const normalizeHeadingText = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(NON_WORD_OR_SPACE, "")
    .replace(WHITESPACE, "-");

export const createSlugger = () => {
  const counts = new Map<string, number>();

  return (text: string): string => {
    const base = normalizeHeadingText(text) || "section";
    const seen = counts.get(base) ?? 0;
    counts.set(base, seen + 1);
    return seen === 0 ? base : `${base}-${seen}`;
  };
};

export const extractHeadingsFromMarkdown = (markdown: string): TocHeading[] => {
  const slugger = createSlugger();
  const headings: TocHeading[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const depth = match[1].length;
    const text = match[2].trim();
    headings.push({
      id: slugger(text),
      text,
      depth,
    });
  }

  return headings;
};
