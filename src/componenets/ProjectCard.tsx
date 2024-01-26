"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useRef, useEffect } from "react";
import { Project } from "typings";
import urlFor from "sanityhelper";
import Link from "next/link";
type Props = { project: Project };

const ExperienceCard = ({ project }: Props) => {
  const childDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: any) => {
      if (childDiv.current) {
        // Get the current and maximum scroll position
        const currentScroll = childDiv.current.scrollTop;
        const maxScroll =
          childDiv.current.scrollHeight - childDiv.current.clientHeight;

        // Check if the div is scrollable and if we're not at the start or end of the scrollable area
        if (
          maxScroll > 0 &&
          ((currentScroll >= maxScroll * 0.05 && e.deltaY < 0) ||
            (currentScroll <= maxScroll * 0.95 && e.deltaY > 0))
        ) {
          // The div is scrollable and we're not at the start trying to scroll up or at the end trying to scroll down
          // So stop the propagation of the wheel event
          e.stopPropagation();
        }
      }
    };
    const childDivRef = childDiv;
    if (childDivRef.current)
      childDivRef.current.addEventListener("wheel", handleWheel);

    // Clean up the event listener when the component unmounts
    return () => {
      if (childDivRef.current)
        childDivRef.current.removeEventListener("wheel", handleWheel);
    };
  }, [childDiv]);
  return (
    <div
      key={project._id}
      ref={childDiv}
      className="diff-from-title flex w-screen flex-shrink-0 snap-center flex-col items-center justify-start space-y-2 overflow-y-auto p-5 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80 sm:space-y-5 md:gap-5 md:px-10"
    >
      <motion.div
        initial={{ y: 300 }}
        transition={{ duration: 0.7 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className=""
      >
        <Image
          src={urlFor(project.image).url()}
          alt={project?.title}
          width={500}
          height={250}
          className="object-cover"
        />
      </motion.div>
      <div className="max-w-6xl space-y-5 px-0 md:space-y-10 md:px-10 pb-5">
        <h4 className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">
          {/* <span className="underline decoration-[#f7ab0a]/50">
                  Case Study {index + 1} of {projects.length} :
                </span>{" "} */}
          {project?.title}
        </h4>
        <div className="flex items-center justify-center space-x-2">
          {project?.technologies.map(
            (technology) =>
              technology?.image && (
                <Image
                  key={technology._id}
                  src={urlFor(technology?.image).url()}
                  alt={technology.title}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  width={44}
                  height={44}
                />
              )
          )}
        </div>
        <p className="text-center text-sm sm:text-base md:text-lg">
          {project?.summary}
        </p>
        <div className="flex items-center justify-center space-x-5 pb-10 md:space-x-10">
          <Link
            href={project?.linkToGithub ? project.linkToGithub : ""}
            className="projectButton"
            target="_blank"
          >
            Github
          </Link>
          <Link
            href={project?.linkToBuild ? project.linkToBuild : ""}
            className="projectButton"
            target="_blank"
          >
            Build
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
