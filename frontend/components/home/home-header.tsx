import Link from "next/link";

export function HomeHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border pb-6">
      <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground">
        What to read AI
      </Link>

      <Link
        href="/signup"
        className="rounded-full border border-foreground px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        Sign Up
      </Link>
    </header>
  );
}
