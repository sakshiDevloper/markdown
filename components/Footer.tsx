"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white py-6 text-center dark:border-zinc-800/50 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        &copy; {currentYear} Copyright
      </p>
    </footer>
  );
}
