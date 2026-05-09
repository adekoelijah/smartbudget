import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Stats from "../components/landing/Stats";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

import { useScrollReveal } from "../hooks/useScrollReveal";

const Landing = () => {
  useScrollReveal(); // 👈 activates global scroll animations

  return (
    <div>
      <Navbar />

      <div className="reveal">
        <Hero />
      </div>

      <div className="reveal">
        <Stats />
      </div>

      <div className="reveal">
        <Features />
      </div>

      <div className="reveal">
        <Pricing />
      </div>

      <div className="reveal">
        <Testimonials />
      </div>

      <div className="reveal">
        <CTA />
      </div>

      <Footer />
    </div>
  );
};
export default Landing;