import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 pt-14 text-center">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Detect failures before they hurt your business
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          Ecom Pulse gives store owners the tools to spot issues fast—downtime,
          broken checkouts, and missed orders—so you can fix them before
          customers notice.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="#"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started
          </Link>
          <Link
            href="#"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
