"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { Project } from "typings";
import urlFor from "sanityhelper";
import Link from "next/link";
type Props = { project: Project };

const ExperienceCard = ({ project }: Props) => {
  return (
    <div className="diff-from-title flex flex-shrink-0 snap-center flex-col items-center justify-start space-y-2 overflow-y-auto p-5 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80 sm:space-y-5 md:gap-5 md:px-10">
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
          className="object-contain w-auto h-auto"
        />
      </motion.div>
      <div className="max-w-6xl space-y-5 px-0 md:space-y-10 md:px-10 pb-5">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">
          {/* <span className="underline decoration-[#f7ab0a]/50">
                  Case Study {index + 1} of {projects.length} :
                </span>{" "} */}
          {project?.title}
        </h2>
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
            aria-label="Github"
            className="projectButton"
            target="_blank"
          >
            Github
          </Link>
          <Link
            href={project?.linkToBuild ? project.linkToBuild : ""}
            aria-label={`Build ${project?.title}`}
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
