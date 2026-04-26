"use client";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types";

type Props = { project: Project };

const ProjectCard = ({ project }: Props) => {
  return (
    <div className="diff-from-title flex shrink-0 snap-center flex-col items-center justify-start space-y-2 overflow-y-auto p-5 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-accent sm:space-y-5 md:gap-5 md:px-10">
      <motion.div
        initial={{ y: 300 }}
        transition={{ duration: 0.7 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Image
          src={project.image}
          alt={project.title}
          width={500}
          height={250}
          className="h-auto w-auto object-contain"
        />
      </motion.div>
      <div className="max-w-6xl space-y-5 px-0 pb-5 md:space-y-10 md:px-10">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">
          {project.title}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {project.technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <Icon
                key={tech.id}
                className="h-8 w-8 text-gray-300 sm:h-10 sm:w-10"
                aria-label={tech.title}
                title={tech.title}
              />
            );
          })}
        </div>
        <p className="text-center text-sm sm:text-base md:text-lg">
          {project.summary}
        </p>
        <div className="flex items-center justify-center space-x-5 pb-10 md:space-x-10">
          {project.linkToGithub && (
            <Link
              href={project.linkToGithub}
              aria-label={`${project.title} on GitHub`}
              className="projectButton"
              target="_blank"
            >
              GitHub
            </Link>
          )}
          {project.linkToBuild && (
            <Link
              href={project.linkToBuild}
              aria-label={`Open ${project.title}`}
              className="projectButton"
              target="_blank"
            >
              Build
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
