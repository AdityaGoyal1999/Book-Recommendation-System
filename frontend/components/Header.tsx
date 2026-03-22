import Link from "next/link";
import type { ReactNode } from "react";

type HeaderProps = {
  /** Replaces the default “Sign up” pill (e.g. auth page “Back to home”). */
  trailing?: ReactNode;
};

/** Same row layout as `HomeHeader`; wrap in a `main` with `px-6 py-8 sm:px-10 lg:px-12` like the landing page. */
export function Header({ trailing }: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between border-b border-border pb-6">
      <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground">
        What to read AI
      </Link>
      {trailing ?? (
        <Link
          href="/signup"
          className="rounded-full border border-foreground px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          Sign Up
        </Link>
      )}
    </header>
  );
}
