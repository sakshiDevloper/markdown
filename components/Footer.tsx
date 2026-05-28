"use client";

import { FiGithub, FiTwitter, FiLinkedin, FiMail } from "react-icons/fi";
import { SiMarkdown } from "react-icons/si";

// Professional footer with multiple columns and social links
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800/50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-12">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <SiMarkdown className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Markdown Converter
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  MD to HTML
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Transform your markdown into beautiful HTML with real-time preview
              and syntax highlighting.
            </p>
          </div>

          {/* Features column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Features
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Live Preview
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Syntax Highlighting
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Export Options
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Responsive Design
                </a>
              </li>
            </ul>
          </div>

          {/* Resources column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <a
                  href="https://marked.js.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Marked.js
                </a>
              </li>
              <li>
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Next.js
                </a>
              </li>
              <li>
                <a
                  href="https://tailwindcss.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Tailwind CSS
                </a>
              </li>
              <li>
                <a
                  href="https://highlight.js.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Highlight.js
                </a>
              </li>
            </ul>
          </div>

          {/* Social links column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Connect
            </h4>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-600/50 dark:hover:bg-indigo-600/10 dark:hover:text-indigo-400"
              >
                <FiGithub className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-600/50 dark:hover:bg-indigo-600/10 dark:hover:text-indigo-400"
              >
                <FiTwitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-600/50 dark:hover:bg-indigo-600/10 dark:hover:text-indigo-400"
              >
                <FiLinkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@example.com"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-600 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-600/50 dark:hover:bg-indigo-600/10 dark:hover:text-indigo-400"
              >
                <FiMail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800/50">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 sm:text-left">
              &copy; {currentYear} Markdown Converter. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <a
                href="#"
                className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-200"
              >
                Privacy
              </a>
              <a
                href="#"
                className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-200"
              >
                Terms
              </a>
              <a
                href="#"
                className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-200"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
