const problems = [
  {
    title: "Too many books, too little time",
    description:
      "Walking into a bookstore with no idea what you want means scrolling through hundreds of spines and blurbs—and that's not the best use of your time.",
  },
  {
    title: "Reading every summary is low ROI",
    description:
      "Checking each book&apos;s back cover or summary one by one doesn&apos;t scale. You need a shortcut to the few titles you&apos;re actually likely to love.",
  },
  {
    title: "Your taste is already on Goodreads",
    description:
      "Your reading history and preferences are sitting in Goodreads, but they don't help you when you're standing in front of a physical shelf deciding what to pick.",
  },
];

const advantages = [
  {
    title: "Snap the shelf, get personalized picks",
    description:
      "Point your phone at the shelf—we use that image plus your Goodreads data and preferences to suggest which books from that display you're most likely to enjoy.",
  },
  {
    title: "High-ROI discovery",
    description:
      "Skip the endless browse. Get a shortlist tailored to you so you spend less time guessing and more time reading books you'll actually like.",
  },
  {
    title: "Built for the in-store moment",
    description:
      "Designed for when you're in a bookstore and don't know where to start. Connect once, set your preferences—then discover your next read in seconds.",
  },
];

export function ProblemAndSolution() {
  return (
    <section className="border-t border-border bg-muted/30 py-16 md:py-24">
      <div className="container px-4">
        <h2 className="font-sans text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Built for readers who don&apos;t want to guess
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Browsing hundreds of books and reading every summary isn&apos;t the best ROI.
          We use your Goodreads data and preferences so you get picks, not noise.
        </p>

        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-2 lg:gap-12">
          {/* Problems */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm md:p-8">
            <h3 className="font-sans text-lg font-semibold text-foreground">
              The problem
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              What book lovers deal with in stores today
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
              Why it works
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              AI-powered discovery that uses your taste
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
