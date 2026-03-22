import { HOME_STEPS } from "./home-constants";

export function StepsSection() {
  return (
    <section className="py-14 pb-14">
      <div className="rounded-3xl px-6 py-10 sm:px-10">
        <div className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight">
            Get personalized recommendations in 3 simple steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-black/70">
            A quick and guided flow that helps you discover books that match your taste.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {HOME_STEPS.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-black/15 bg-[#efeeed] p-6"
            >
              <p className="text-sm font-semibold tracking-[0.2em] text-black/60">{step.number}</p>
              <h3 className="mt-3 text-2xl font-semibold leading-tight">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-black/70">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
