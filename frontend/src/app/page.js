import StatsBar from "@/components/StatsBar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TeaGame from "@/components/TeaGame";
import HowItWorks from "@/components/HowItWorks";
import PostShowcase from "@/components/PostShowcase";
import Testimonial from "@/components/Testimonial";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import ScrollProgress from "@/components/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <main style={{ background: "#ffffff" }}>
        <Hero />
        <StatsBar />
        <Features />
        <TeaGame />
        <HowItWorks />
        <PostShowcase />
        <Testimonial />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  );
}