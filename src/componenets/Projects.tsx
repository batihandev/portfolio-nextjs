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
      className="relative z-0 mx-auto flex h-screen max-w-full flex-col items-center justify-start overflow-hidden text-left md:flex-col"
    >
      <h3 className="pageTitles">Projects</h3>
      <div className="relative z-20  flex w-full snap-x  snap-mandatory overflow-x-auto scrollbar overflow-y-hidden scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
        {projects?.map((project) => (
          <div
            key={project._id}
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
            <div className="max-w-6xl space-y-5 px-0 md:space-y-10 md:px-10">
              <h4 className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">
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
        ))}
      </div>
      <div className="absolute top-[30%] left-0 h-[500px] w-full -skew-y-12 bg-[#F7AB0A]/10"></div>
    </motion.div>
  );
}

export default Projects;
