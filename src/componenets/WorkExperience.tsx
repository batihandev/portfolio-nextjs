import React from "react";
import { Experience } from "typings";
import ExperienceCard from "./ExperienceCard";

type Props = { experiences: Experience[] };

const WorkExperience = ({ experiences }: Props) => {
  return (
    <div className="relative mx-auto flex h-screen max-w-full flex-col items-center justify-evenly overflow-hidden px-10 text-left md:flex-row">
      <h3 className="pageTitles">Experience</h3>
      <div className=" flex w-full snap-x snap-mandatory space-x-5 overflow-x-scroll p-10 scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
        {experiences.map((experience) => (
          <ExperienceCard key={experience._id} experience={experience} />
        ))}
      </div>
    </div>
  );
};

export default WorkExperience;
