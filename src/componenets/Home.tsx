"use client";
import Header from "@/componenets/Header";
import Hero from "@/componenets/Hero";
import About from "@/componenets/About";
import Skills from "@/componenets/Skills";
import Projects from "@/componenets/Projects";
import ContactMe from "@/componenets/ContactMe";
import WorkExperience from "@/componenets/WorkExperience";
import { ArrowSmallUpIcon } from "@heroicons/react/24/outline";
import { Experience, PageInfo, Project, Skill, Social } from "typings";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
// test new github
type Props = {
  pageInfo: PageInfo;
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  socials: Social[];
};
const options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.2,
};
export default function Home({
  pageInfo,
  experiences,
  skills,
  projects,
  socials,
}: Props) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const callbackFunction = (entries: any) => {
    const [entry] = entries;
    setIsVisible(entry.isIntersecting);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [containerRef]);

  return (
    <div className="z-0 h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth  bg-[rgb(36,36,36)] text-white scrollbar overflow-x-hidden scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
      <Header socials={socials} />
      <section id="hero" className="snap-center">
        <Hero pageInfo={pageInfo} />
      </section>
      <div ref={containerRef}>
        <section id="about" className="snap-center">
          <About pageInfo={pageInfo} />
        </section>
        <section id="experience" className="snap-center">
          <WorkExperience experiences={experiences} />
        </section>

        <section id="skills" className="snap-start">
          <Skills skills={skills} />
        </section>
        <section id="projects" className="snap-start">
          <Projects projects={projects} />
        </section>
        <section id="contact" className="snap-start">
          <ContactMe pageInfo={pageInfo} />
        </section>
      </div>

      <footer className="sticky bottom-14 ml-6 w-fit cursor-pointer md:bottom-16 md:ml-16">
        {isVisible ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            className="flex items-center justify-start"
          >
            <a href="#hero" className="flex shrink-0">
              <ArrowSmallUpIcon className="h-10 w-10 rounded-full bg-[#F7AB0A] opacity-40 transition-opacity duration-150 ease-in-out hover:opacity-100" />
            </a>
          </motion.div>
        ) : (
          <div className="flex items-center justify-start">
            <ArrowSmallUpIcon className="h-10 w-10 rounded-full opacity-0" />
          </div>
        )}
      </footer>
    </div>
  );
}
