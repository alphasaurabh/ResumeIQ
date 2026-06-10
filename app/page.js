import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Workflow from "../components/landing/Workflow";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-slate-900 selection:bg-indigo-200 selection:text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.06),transparent_28%),radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-size-[72px_72px] opacity-30" />

      <Navbar />

      <div className="relative z-10">
        <Hero />
        <Features />
        <Workflow />
        <Footer />
      </div>
    </main>
  );
}
