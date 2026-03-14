"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs: { question: string; answer: string }[] = [
  {
    question: "How much does it really cost?",
    answer:
      "Free tier is $0 forever—no credit card required. Pro is $29/month with a 14-day free trial. Enterprise pricing is custom based on your store count and needs. No hidden fees or long-term contracts.",
  },
  {
    question: "Does it work with my store?",
    answer:
      "Ecom Pulse works with Shopify, WooCommerce, BigCommerce, and other platforms that expose order or checkout data. Setup usually takes under 10 minutes: add your store URL and connect alerts. We’ll guide you step by step.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use encryption in transit and at rest, don’t store payment details, and only access the data needed to run checks (e.g. uptime, order counts). We’re SOC 2 compliant and happy to sign DPAs for Enterprise customers.",
  },
  {
    question: "What if I need help?",
    answer:
      "Free and Pro users get email support and in-app docs. Enterprise includes a dedicated success manager and priority support. We aim to reply within 24 hours for standard plans.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can downgrade or cancel from your account settings. No lock-in—we’ll keep your data available for 30 days after cancellation so you can export if needed.",
  },
  {
    question: "How do alerts work?",
    answer:
      "You choose how to be notified: email, Slack, or (on Enterprise) PagerDuty or webhooks. You set the rules—e.g. “alert if checkout is down for 2 minutes” or “alert if orders drop 50% vs. yesterday.”",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-border bg-background py-16 md:py-24">
      <div className="container px-4">
        <h2 className="font-sans text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Quick answers to common questions about pricing, setup, and support.
        </p>

        <div className="mx-auto mt-12 max-w-2xl space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-lg border border-border bg-card transition-colors hover:border-border/80"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-lg"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  {faq.question}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={`overflow-hidden transition-[height] duration-200 ease-out ${isOpen ? "visible" : "hidden"}`}
                >
                  <p className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
