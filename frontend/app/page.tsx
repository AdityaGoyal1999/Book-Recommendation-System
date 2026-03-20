import Link from "next/link";
import { BookOpenText, PencilLine, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#efeeed] text-[#0e0e0f]">
      <main className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-black/15 pb-6">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            What to read AI
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-black/75 md:flex">
            <Link href="#" className="transition-colors hover:text-black">
              Discover
            </Link>
            <Link href="#" className="transition-colors hover:text-black">
              Bookstore
            </Link>
            <Link href="#" className="transition-colors hover:text-black">
              Self study
            </Link>
            <Link href="#" className="transition-colors hover:text-black">
              Contacts
            </Link>
            <Link href="#" className="transition-colors hover:text-black">
              Blog
            </Link>
          </nav>

          <Link
            href="/signup"
            className="rounded-full border border-black px-5 py-2 text-sm font-semibold transition-colors hover:bg-black hover:text-white"
          >
            Sign Up
          </Link>
        </header>

        <section className="grid gap-10 border-b border-black/15 py-12 md:grid-cols-2 md:items-center">
          <div className="space-y-7">
            <h1 className="max-w-md text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Welcome to What to read AI where you can find the best books for you.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-black/70">
              Explore the best books for you in no time.
            </p>
            <Link
              href="/signup"
              className="inline-flex rounded-xl bg-black px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-black/85"
            >
              Get Started
            </Link>
          </div>

          <div className="relative mx-auto flex h-[360px] w-full max-w-[460px] items-center justify-center overflow-hidden rounded-3xl border border-black/10 bg-white/70">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(0,0,0,0.06),transparent_45%),radial-gradient(circle_at_90%_85%,rgba(0,0,0,0.08),transparent_45%)]" />
            <div className="relative z-10 flex w-full max-w-[360px] flex-col items-center gap-5">
              <div className="flex items-end gap-3">
                <BookOpenText className="size-16 text-black" strokeWidth={1.8} />
                <PencilLine className="size-14 -rotate-12 text-black" strokeWidth={1.8} />
                <Sparkles className="size-8 text-black/80" strokeWidth={1.8} />
              </div>
              <div className="w-full space-y-3">
                <div className="h-5 rounded-full border border-black/20 bg-black/10" />
                <div className="h-5 rounded-full border border-black/20 bg-black/10" />
                <div className="h-5 w-4/5 rounded-full border border-black/20 bg-black/10" />
              </div>
              <div className="grid w-full grid-cols-2 gap-3">
                <div className="h-20 rounded-2xl border border-black/20 bg-[#ff7a1a]" />
                <div className="h-20 rounded-2xl border border-black/20 bg-white" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="rounded-3xl border border-black/10 bg-white/55 px-8 py-12 text-center sm:px-12">
            <h2 className="text-4xl font-semibold tracking-tight">
              Have you ever walked into a bookstore and felt overwhelmed by
              hundreds of books in front of you?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-black/70">
              What to read AI cuts through the noise with personalized
              recommendations, so you can quickly find your next favorite read.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
