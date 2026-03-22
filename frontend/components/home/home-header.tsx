import Link from "next/link";

export function HomeHeader() {
  return (
    <header className="flex items-center justify-between border-b border-black/15 pb-6">
      <Link href="/" className="text-2xl font-semibold tracking-tight">
        What to read AI
      </Link>

      <Link
        href="/signup"
        className="rounded-full border border-black px-5 py-2 text-sm font-semibold transition-colors hover:bg-black hover:text-white"
      >
        Sign Up
      </Link>
    </header>
  );
}
