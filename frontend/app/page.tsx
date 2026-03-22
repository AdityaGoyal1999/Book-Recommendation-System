import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { HomeHero } from "@/components/home/home-hero";
import { ProblemSection } from "@/components/home/problem-section";
import { StepsSection } from "@/components/home/steps-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-10 lg:px-12">
        <HomeHeader />
        <HomeHero />
        <ProblemSection />
        <StepsSection />
      </main>
      <HomeFooter />
    </div>
  );
}
