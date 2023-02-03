"use client";
import Header from "@/componenets/Header";
import Hero from "@/componenets/Hero";
import About from "@/componenets/About";
import Skills from "@/componenets/Skills";
import Projects from "@/componenets/Projects";
import ContactMe from "@/componenets/ContactMe";
import { ArrowSmallUpIcon } from "@heroicons/react/24/outline";
import { Experience, PageInfo, Project, Skill, Social } from "typings";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    console.log(isVisible);
  }, [isVisible]);

  return (
    <div className="bg-[rgb(36,36,36)] scroll-smooth text-white h-screen snap-y snap-mandatory  z-0 overflow-y-scroll overflow-x-hidden scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
      <Header socials={socials} />
      <section id="hero" className="snap-center">
        <Hero pageInfo={pageInfo} />
      </section>
      <div ref={containerRef}>
        <section id="about" className="snap-center">
          <About pageInfo={pageInfo} />
        </section>
        {/* <section id="experience" className="snap-center">
          <WorkExperience experiences={experiences} />
        </section> */}

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

      <footer className="sticky bottom-6 ml-6 md:ml-16 md:bottom-16 w-full cursor-pointer">
        {isVisible ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.4 }}
            className="flex items-center justify-start"
          >
            <a href="#hero">
              <ArrowSmallUpIcon className="h-10 w-10 rounded-full bg-[#F7AB0A] opacity-40 hover:opacity-100 transition-opacity duration-150 ease-in-out" />
            </a>
          </motion.div>
        ) : (
          <div className="flex items-center justify-start">
            <ArrowSmallUpIcon className="opacity-0 w-10 h-10 rounded-full" />
          </div>
        )}
      </footer>
    </div>
  );
}
