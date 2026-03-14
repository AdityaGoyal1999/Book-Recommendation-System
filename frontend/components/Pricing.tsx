import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$ N/A",
    period: "forever",
    differentiator: "Get started with core monitoring—no credit card required.",
    features: [
      "1 store",
      "Uptime checks every 15 min",
      "Email alerts",
      "7-day history",
    ],
    cta: "Start free",
    ctaHref: "/signup",
    primary: false,
  },
  {
    name: "Pro",
    price: "$ N/A",
    period: "/month",
    differentiator: "For growing stores that need faster checks and more coverage.",
    features: [
      "Up to 5 stores",
      "Uptime checks every 1 min",
      "Checkout & order flow monitoring",
      "Slack & email alerts",
      "90-day history",
    ],
    cta: "Start free trial",
    ctaHref: "/signup",
    primary: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    differentiator: "Dedicated support, SLAs, and custom integrations for high-volume stores.",
    features: [
      "Unlimited stores",
      "Real-time monitoring",
      "Custom alert rules & on-call",
      "API & webhooks",
      "Dedicated success manager",
    ],
    cta: "Contact sales",
    ctaHref: "#",
    primary: false,
  },
];

export function Pricing() {
  return (
    <section className="border-t border-border bg-muted/30 py-16 md:py-24">
      <div className="container px-4">
        <h2 className="font-sans text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Simple pricing, no surprises
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Start free and upgrade when you need more. No long-term contracts.
        </p>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:mt-16 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border p-6 shadow-sm md:p-8 ${
                plan.primary
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-background"
              }`}
            >
              <h3 className="font-sans text-lg font-semibold text-foreground">
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-sans text-3xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.differentiator}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                className={`mt-8 inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  plan.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border bg-background hover:bg-muted hover:text-foreground"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
