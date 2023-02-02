"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import urlFor from "sanityhelper";
import { Project } from "typings";

type Props = {
  projects: Project[];
};

function Projects({ projects }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="h-screen relative flex overflow-hidden flex-col text-left md:flex-row max-w-full justify-evenly mx-auto items-center z-0"
    >
      <h3 className="pageTitles">Projects</h3>
      <div className="relative w-full mt-10  flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory z-20 scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
        {projects?.map((project, index) => (
          <div
            key={project._id}
            className="w-screen flex-shrink-0 snap-center flex flex-col space-y-2 sm:space-y-5 md:gap-5 items-center justify-center p-5 md:px-10 h-screen"
          >
            <motion.div
              initial={{ y: 300 }}
              transition={{ duration: 1.2 }}
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
            <div className="space-y-5 md:space-y-10 px-0 md:px-10 max-w-6xl">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">
                {/* <span className="underline decoration-[#f7ab0a]/50">
                  Case Study {index + 1} of {projects.length} :
                </span>{" "} */}
                {project?.title}
              </h4>
              <div className="flex items-center justify-center space-x-2">
                {project?.technologies.map((technology) => (
                  <Image
                    key={technology._id}
                    src={urlFor(technology.image).url()}
                    alt={technology.title}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    width={44}
                    height={44}
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base md:text-lg text-center">
                {project?.summary}
              </p>
              <div className="flex items-center justify-center space-x-5 md:space-x-10">
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
        ))}
      </div>
      <div className="w-full absolute top-[30%] bg-[#F7AB0A]/10 left-0 h-[500px] -skew-y-12"></div>
    </motion.div>
  );
}

export default Projects;
