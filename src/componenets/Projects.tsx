"use client";
import { motion } from "framer-motion";
import { tree } from "next/dist/build/templates/app-page";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useEffect, useState } from "react";
import urlFor from "sanityhelper";
import { Project } from "typings";
import ProjectCard from "./ProjectCard";
import experience from "sanity/schemas/experience";

type Props = {
  projects: Project[];
};

function Projects({ projects }: Props) {
  const scrollDiv = useRef<HTMLDivElement>(null);
  const childDiv = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(true);

  useEffect(() => {
    const handleWheel = (e: any) => {
      if (!scrollDiv.current) return;
      // Get the screen width

      const screenWidth = window.innerWidth;

      // Get the current and maximum scroll position

      const currentScroll = scrollDiv.current.scrollLeft;
      const maxScroll =
        scrollDiv.current.scrollWidth - scrollDiv.current.clientWidth;

      // Check if we're at the start or end of the scrollable area
      if (
        (currentScroll === 0 && e.deltaY < 0) ||
        (currentScroll === maxScroll && e.deltaY > 0)
      ) {
        // We're at the start and trying to scroll up, or at the end and trying to scroll down
        // So let the wheel event do its default behavior (vertical scrolling)
        return;
      }

      // Prevent the default behavior of the wheel event (vertical scrolling)
      e.preventDefault();

      // Adjust the scrollLeft property based on the deltaY property
      if (e.deltaY > 0) {
        // User is scrolling down, so scroll to the next element
        scrollDiv.current.scrollLeft += screenWidth;
      } else {
        // User is scrolling up, so scroll to the previous element
        scrollDiv.current.scrollLeft -= screenWidth;
      }
    };
    const scrollDivRef = scrollDiv;
    if (scrollDivRef.current)
      scrollDivRef.current.addEventListener("wheel", handleWheel);

    // Clean up the event listener when the component unmounts
    return () => {
      if (scrollDivRef.current)
        scrollDivRef.current.removeEventListener("wheel", handleWheel);
    };
  }, [scrollDiv]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative z-0 mx-auto flex h-[100svh] max-w-full flex-col items-center justify-start overflow-hidden text-left md:flex-col"
    >
      <h3 className="pageTitles">Projects</h3>
      <div
        ref={scrollDiv}
        className="relative z-20  flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar overflow-y-hidden scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80"
      >
        {projects?.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
      <div className="absolute top-[30%] left-0 h-[500px] w-full -skew-y-12 bg-[#F7AB0A]/10"></div>
    </motion.div>
  );
}

export default Projects;
