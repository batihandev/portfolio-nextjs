"use client";
import Image from "next/image";
import React from "react";
import { Experience } from "typings";
import urlFor from "sanityhelper";
type Props = { experience: Experience };

const ExperienceCard = ({ experience }: Props) => {
  return (
    <article className="flex w-full h-full flex-shrink-0 cursor-pointer snap-center flex-col overflow-hidden rounded-lg bg-[#292929] p-5 opacity-40 transition-opacity duration-200 hover:opacity-100 ">
      {/* <motion.div
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
      </motion.div> */}
      <div className=" flex flex-col h-full space-y-2 overflow-y-auto px-0 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A] md:px-10">
        <div className="">
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
          <p className="text-gray uppercase">
            {new Date(experience.dateStarted).toDateString()} -{" "}
            {experience.isCurrentlyWorkingHere
              ? "Present"
              : new Date(experience.dateEnded).toDateString()}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-gray uppercase">{experience.description}</p>
          <ul className="s ml-5 mb-5 list-disc space-y-4  pr-3 text-lg  ">
            {experience.descriptionlist.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
};

export default ExperienceCard;
