"use client";

import { FiGithub, FiTwitter } from "react-icons/fi";
import { SiMarkdown } from "react-icons/si";
import ThemeToggle from "./ThemeToggle";

// Sticky modern navbar with theme toggle and social links
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <SiMarkdown className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
                Markdown
              </h1>
              <p className="text-[10px] leading-none text-zinc-500 dark:text-zinc-400">
                Convert
              </p>
            </div>
          </div>

          {/* Right side: theme toggle and social links */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white/50 text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <FiGithub className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white/50 text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <FiTwitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}