import {
  Zap,
  ShieldCheck,
  ShoppingCart,
  BellRing,
  Activity,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const features: {
  icon: LucideIcon;
  title: string;
  benefit: string;
}[] = [
  {
    icon: Zap,
    title: "Instant alerts",
    benefit: "Catch failures in minutes, not hours—so you can fix issues before they cost sales.",
  },
  {
    icon: ShieldCheck,
    title: "Uptime monitoring",
    benefit: "Know the moment your store goes down so you can act before customers bounce.",
  },
  {
    icon: ShoppingCart,
    title: "Checkout health",
    benefit: "Spot broken checkouts and payment hiccups before support tickets pile up.",
  },
  {
    icon: BellRing,
    title: "Order flow alerts",
    benefit: "Get notified when orders drop or stop—so you never miss a silent failure.",
  },
  {
    icon: Activity,
    title: "Real-time signals",
    benefit: "See what’s happening now, not yesterday’s reports—decide with fresh data.",
  },
  {
    icon: TrendingUp,
    title: "Revenue protection",
    benefit: "Focus on the metrics that protect your bottom line, not vanity stats.",
  },
];

export function Features() {
  return (
    <section className="border-t border-border bg-background py-16 md:py-24">
      <div className="container px-4">
        <h2 className="font-sans text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Built for outcomes, not just data
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Every feature is designed to help you detect and fix problems fast—so
          your store stays healthy and your revenue stays protected.
        </p>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, benefit }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/30 hover:bg-card/80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-sans font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{benefit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
