import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProblemAndSolution } from "@/components/ProblemAndSolution";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <Hero />
        <ProblemAndSolution />
      </main>
    </div>
  );
}
