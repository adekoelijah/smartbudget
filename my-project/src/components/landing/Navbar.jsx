


import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

const navLinks = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "Testimonials",
    href: "#testimonials",
  },
  {
    label: "Pricing",
    href: "#pricing",
  },
];

export default function Navbar({ isAuthenticated = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.querySelector(id);
        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 150);
      return;
    }

    const section = document.querySelector(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 shadow-[0_20px_60px_rgba(0,0,0,.45)] ${
          scrolled
? `
backdrop-blur-3xl
bg-gradient-to-r
from-slate-950/95
via-[#081c2d]/95
to-slate-950/95
border-b border-cyan-500/10
shadow-[0_15px_50px_rgba(0,0,0,.45)]
`
            : `
bg-gradient-to-r
from-slate-950/90
via-[#071827]/90
to-slate-950/90
backdrop-blur-xl
`
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-cyan-500 blur-lg opacity-40 group-hover:opacity-80 transition" />

              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <div className="relative">

    {/* Glow */}
    <div className="
        absolute
        -inset-1
        rounded-2xl
        bg-gradient-to-r
        from-cyan-400
        via-blue-500
        to-indigo-600
        blur-xl
        opacity-60
        group-hover:opacity-100
        transition
    "/>

    {/* Glass Card */}
    <div className="
        relative
        w-12
        h-12
        rounded-2xl

        bg-gradient-to-br
        from-cyan-400
        via-sky-500
        to-blue-700

        border
        border-white/20

        flex
        items-center
        justify-center

        shadow-[0_15px_35px_rgba(6,182,212,.45)]
    ">

        <span className="
            text-white
            font-black
            text-lg
            tracking-tight
        ">
            SB
        </span>

    </div>

</div>
              </div>
            </div>

            <div>
              <h2 className="
font-black
text-2xl
tracking-tight
bg-gradient-to-r
from-white
via-cyan-100
to-cyan-400
bg-clip-text
text-transparent
">
    SmartBudget
</h2>

              <p className="text-[11px] text-cyan-300">
                AI Financial System
              </p>
            </div>
          </Link>

          {/* DESKTOP LINKS */}

          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="
relative
px-5
py-3
rounded-full

text-gray-300

hover:text-white

transition-all
duration-300

hover:bg-white/5

before:absolute
before:inset-0
before:rounded-full
before:border
before:border-cyan-400/0

hover:before:border-cyan-400/20
cursor-pointer
"
              >
                {item.label}

                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-cyan-400 rounded-full transition-all duration-300 hover:w-8" />
              </button>
            ))}
          </nav>

          {/* RIGHT */}

          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:scale-105 transition"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r
from-cyan-400
via-sky-500
to-indigo-600

shadow-[0_10px_35px_rgba(6,182,212,.45)]

hover:shadow-[0_20px_50px_rgba(6,182,212,.6)]

hover:scale-105 text-white font-semibold hover:scale-105 transition"
                >
                  Get Started

                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition"
                  />
                </Link>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-11 h-11 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
    opacity:0,
    scale:.96,
    y:-20
}}

animate={{
    opacity:1,
    scale:1,
    y:0
}}

exit={{
    opacity:0,
    scale:.96,
    y:-20
}}

transition={{
    type:"spring",
    stiffness:300,
    damping:28
}}
            transition={{
              duration: 0.25,
            }}
            className="fixed top-20 left-4 right-4 z-40 lg:hidden"
          >
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,.55)]">
              <div className="p-6">
                <div className="space-y-2">
                  {navLinks.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => scrollToSection(item.href)}
                      className="w-full text-left px-5 py-4 rounded-2xl text-gray-300 hover:text-white hover:bg-white/5 transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 border-t border-white/10 pt-6 space-y-3">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex justify-center items-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex justify-center items-center w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
                      >
                        Login
                      </Link>

                      <Link
                        to="/signup"
                        onClick={() => setMobileOpen(false)}
                        className="flex justify-center items-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-semibold"
                      >
                        Get Started

                        <ArrowRight size={18} />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
);
}