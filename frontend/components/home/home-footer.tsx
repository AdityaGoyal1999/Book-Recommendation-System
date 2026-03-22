import Link from "next/link";

export function HomeFooter() {
  return (
    <footer className="border-t border-black/15">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div>
          <p className="text-xl font-semibold tracking-tight">What to read AI</p>
          <p className="mt-2 text-sm text-black/65">
            Personalized book recommendations to help you pick your next read.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-black/70">
          <Link href="/signup" className="transition-colors hover:text-black">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}
