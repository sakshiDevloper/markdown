export interface LintWarning {
  line: number;
  message: string;
  severity: "info" | "warning" | "error";
}

/**
 * Simple markdown linter that checks common issues.
 */
export function lintMarkdown(markdown: string): LintWarning[] {
  const warnings: LintWarning[] = [];
  const lines = markdown.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 1. Check for multiple consecutive blank lines
    if (i > 0 && line === "" && lines[i - 1] === "" && lines[i - 2] === "") {
      warnings.push({
        line: lineNum,
        message: "Multiple consecutive blank lines (max 2 allowed)",
        severity: "warning",
      });
    }

    // 2. Check heading format: space after #
    const headingMatch = line.match(/^(#{1,6})([^#\s])/);
    if (headingMatch) {
      warnings.push({
        line: lineNum,
        message: `Missing space after heading markers: "${headingMatch[1]}${headingMatch[2]}"`,
        severity: "error",
      });
    }

    // 3. Check heading with no space
    if (line.startsWith("#") && !line.startsWith("##")) {
      const match = line.match(/^#{1,6}\S/);
      if (match) {
        warnings.push({
          line: lineNum,
          message: "Missing space after # markers",
          severity: "warning",
        });
      }
    }

    // 4. Check for trailing whitespace
    if (line.length > 0 && line !== line.trimEnd()) {
      warnings.push({
        line: lineNum,
        message: "Trailing whitespace detected",
        severity: "info",
      });
    }

    // 5. Check list marker spacing
    const listMatch = line.match(/^(\s*[-*+]\s{2,})(\S)/);
    if (listMatch) {
      warnings.push({
        line: lineNum,
        message: "Extra space after list marker",
        severity: "info",
      });
    }

    // 6. Check for long lines (> 80 chars) in paragraphs
    if (
      line.length > 80 &&
      !line.startsWith("#") &&
      !line.startsWith("|") &&
      !line.startsWith("```") &&
      !line.startsWith(">") &&
      !line.match(/^\s*[-*+]\s/) &&
      !line.match(/^\s*\d+\.\s/)
    ) {
      warnings.push({
        line: lineNum,
        message: `Line too long (${line.length} chars, max 80 recommended)`,
        severity: "info",
      });
    }

    // 7. Check unclosed code spans
    const backtickCount = (line.match(/`/g) || []).length;
    if (backtickCount % 2 !== 0 && !line.includes("```")) {
      warnings.push({
        line: lineNum,
        message: "Unmatched backtick (possible unclosed inline code)",
        severity: "warning",
      });
    }

    // 8. Check for bare URLs (without angle brackets)
    const bareUrlMatch = line.match(/(?<!`)(https?:\/\/[^\s`"'\]\)<>]+)(?!`)/);
    if (bareUrlMatch && !line.includes("<") && !line.includes("](")) {
      warnings.push({
        line: lineNum,
        message: `Bare URL detected — wrap with < > for better compatibility: "${bareUrlMatch[1]}"`,
        severity: "info",
      });
    }
  }

  // 9. Check document-level rules
  const headingCount = lines.filter((l) => /^#{1,6}\s/.test(l)).length;
  if (headingCount === 0 && lines.filter((l) => l.trim()).length > 5) {
    warnings.push({
      line: 1,
      message: "Document has no headings — consider adding structure",
      severity: "info",
    });
  }

  return warnings;
}