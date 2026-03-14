import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProblemAndSolution } from "@/components/ProblemAndSolution";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <Hero />
        <Features />
        <ProblemAndSolution />
        <Pricing />
        <FAQ />
      </main>
    </div>
  );
}
