"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import Header from "./Header";
import Hero from "./Hero";
import About from "./About";
import WorkExperience from "./WorkExperience";
import Skills from "./Skills";
import ContactMe from "./ContactMe";

const Home = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsPastHero(Boolean(entry?.isIntersecting)),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="z-0 h-svh snap-y snap-mandatory overflow-x-hidden overflow-y-scroll scroll-smooth bg-surface text-white scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-accent">
      <Header />
      <section id="hero" className="snap-center">
        <Hero />
      </section>
      <div ref={containerRef}>
        <section id="about" className="snap-center">
          <About />
        </section>
        <section id="experience" className="snap-center">
          <WorkExperience />
        </section>
        <section id="skills" className="snap-start">
          <Skills />
        </section>
        <section id="contact" className="snap-start">
          <ContactMe />
        </section>
      </div>

      <footer className="sticky bottom-14 ml-6 w-fit cursor-pointer md:bottom-16 md:ml-16">
        {isPastHero ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            className="flex items-center justify-start"
          >
            <a href="#hero" className="flex shrink-0" aria-label="Back to top">
              <ArrowUpIcon className="h-10 w-10 rounded-full bg-accent opacity-40 transition-opacity duration-150 ease-in-out hover:opacity-100" />
            </a>
          </motion.div>
        ) : (
          <div className="flex items-center justify-start">
            <ArrowUpIcon className="h-10 w-10 rounded-full opacity-0" />
          </div>
        )}
      </footer>
    </div>
  );
};

export default Home;
