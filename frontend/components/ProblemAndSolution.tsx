const problems = [
  {
    title: "Analytics are a headache",
    description:
      "Google Analytics and similar tools are hard to set up, full of jargon, and take time you don't have to configure correctly.",
  },
  {
    title: "You pay for noise",
    description:
      "Expensive platform add-ons and dashboards charge a lot for vanity metrics that don't tell you when your store is actually broken.",
  },
  {
    title: "Failures hide in the crowd",
    description:
      "When checkout breaks or orders stop coming through, you often find out from customers—or too late—instead of catching it first.",
  },
];

const advantages = [
  {
    title: "Simple setup, real signals",
    description:
      "Get going quickly without complex tagging or funnels. Ecom Pulse focuses on what matters: is your store up, and are orders flowing?",
  },
  {
    title: "Pricing that makes sense",
    description:
      "No bloated feature lists or per-seat upsells. You get the metrics that protect your revenue, at a price that fits your business.",
  },
  {
    title: "Failures caught early",
    description:
      "Know right away when something's wrong—downtime, broken checkouts, or silent order drops—so you can fix it before it costs you.",
  },
];

export function ProblemAndSolution() {
  return (
    <section className="border-t border-border bg-muted/30 py-16 md:py-24">
      <div className="container px-4">
        <h2 className="font-sans text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Built for store owners who need answers, not dashboards
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Most analytics are built for marketers. Ecom Pulse is built for
          operators—so you can see problems before they become lost sales.
        </p>

        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-2 lg:gap-12">
          {/* Problems */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm md:p-8">
            <h3 className="font-sans text-lg font-semibold text-foreground">
              The problem
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              What many store owners deal with today
            </p>
            <ul className="mt-6 space-y-5">
              {problems.map((item) => (
                <li key={item.title}>
                  <span className="font-medium text-foreground">
                    {item.title}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Advantages / Why Ecom Pulse */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm md:p-8">
            <h3 className="font-sans text-lg font-semibold text-foreground">
              Why Ecom Pulse
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Focused monitoring that actually helps
            </p>
            <ul className="mt-6 space-y-5">
              {advantages.map((item) => (
                <li key={item.title}>
                  <span className="font-medium text-foreground">
                    {item.title}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
