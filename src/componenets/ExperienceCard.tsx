"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useRef, useEffect } from "react";
import { Experience } from "typings";
import urlFor from "sanityhelper";
type Props = { experience: Experience };

const ExperienceCard = ({ experience }: Props) => {
  const childDiv = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
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
    };

    childDiv.current.addEventListener("wheel", handleWheel);

    // Clean up the event listener when the component unmounts
    return () => {
      childDiv.current.removeEventListener("wheel", handleWheel);
    };
  }, []);
  return (
    <article className="flex w-[350px] flex-shrink-0 cursor-pointer snap-center flex-col overflow-hidden rounded-lg bg-[#292929] p-5 opacity-40 transition-opacity duration-200 hover:opacity-100 sm:w-[500px] md:w-[600px]  xl:w-[900px]">
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
      <div
        ref={childDiv}
        className=" max-h-full   space-y-2 overflow-y-scroll px-0 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A] md:px-10"
      >
        <div className="max-h-[39%]">
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
          <p className="text-gray py-2 uppercase md:py-5">
            {new Date(experience.dateStarted).toDateString()} -{" "}
            {experience.isCurrentlyWorkingHere
              ? "Present"
              : new Date(experience.dateEnded).toDateString()}
          </p>
        </div>
        {/* <ul className="scrollbar-thumb-[#F7AB0A]/8 ml-5 max-h-80 list-disc space-y-4 overflow-auto pr-3 text-lg scrollbar-thin scrollbar-track-gray-400/20">
          {experience.points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul> */}
        <div className="mt-2 max-h-[60%]">
          <p className="text-gray py-2 uppercase md:py-5">
            {experience.description}
          </p>
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
