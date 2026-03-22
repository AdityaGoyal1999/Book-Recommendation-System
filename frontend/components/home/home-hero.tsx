import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
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

      <div className="relative mx-auto flex h-[500px] w-full max-w-[500px] items-center justify-center overflow-hidden p-4">
        <Image
          src="/hero-image.svg"
          alt="Reader discovering personalized book recommendations"
          width={500}
          height={500}
          className="h-full w-full object-contain"
          priority
        />
      </div>
    </section>
  );
}
