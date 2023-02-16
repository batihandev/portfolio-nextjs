"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { Experience } from "typings";
import urlFor from "sanityhelper";
type Props = { experience: Experience };

const ExperienceCard = ({ experience }: Props) => {
  return (
    <article className="flex w-[500px] flex-shrink-0 cursor-pointer snap-center flex-col items-center space-y-7 overflow-hidden rounded-lg bg-[#292929] p-10 opacity-40 transition-opacity duration-200 hover:opacity-100 md:w-[600px]  xl:w-[900px]">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        transition={{ duration: 1.2 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="h-32 w-32 xl:h-[200px] xl:w-[200px]"
      >
        <Image
          className="rounded-full object-cover object-center md:rounded-full"
          src={urlFor(experience?.companyImage).url()}
          alt=""
          width={200}
          height={200}
        />
      </motion.div>
      <div className="px-0 md:px-10">
        <h4 className="text-4xl font-light">{experience?.jobTitle}</h4>
        <p className="mt-1 text-2xl font-bold">{experience?.company}</p>
        <div className="my-2 flex space-x-2">
          {experience?.technologies.map((technology) => (
            <Image
              key={technology._id}
              className="h-10 w-10 rounded-full"
              src={urlFor(technology.image).url()}
              width={40}
              height={40}
              alt={technology.title}
            />
          ))}
        </div>
        <p className="text-gray py-5 uppercase">
          {new Date(experience.dateStarted).toDateString()} -{" "}
          {experience.isCurrentlyWorkingHere
            ? "Present"
            : new Date(experience.dateEnded).toDateString()}
        </p>
        <ul className="scrollbar-thumb-[#F7AB0A]/8 ml-5 max-h-80 list-disc space-y-4 overflow-auto pr-3 text-lg scrollbar-thin scrollbar-track-gray-400/20">
          {experience.points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>
    </article>
  );
};

export default ExperienceCard;
