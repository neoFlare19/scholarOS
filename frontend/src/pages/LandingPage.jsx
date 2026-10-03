import { motion } from "framer-motion";
import SiteHeader from "../layout/SiteHeader.jsx";
import SiteFooter from "../layout/SiteFooter.jsx";
import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  ProblemSection,
  ShowcaseSection,
  SolutionSection,
  TestimonialsSection,
  TrustSection,
} from "../sections/landing/LandingSections.jsx";

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative min-h-screen"
    >
      <SiteHeader />
      <main>
        <HeroSection />
        <TrustSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ShowcaseSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </motion.div>
  );
}
