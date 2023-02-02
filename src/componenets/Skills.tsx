"use client";
import { motion } from "framer-motion";
import React from "react";
import { Skill } from "typings";
import SkillIcon from "./SkillIcon";

type Props = { skills: Skill[] };

const Skills = ({ skills }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="h-screen relative flex flex-col text-center md:Text-left max-w-[2000px] xl:px-10 min-h-screen justify-start xl:space-y-0 mx-auto items-center overflow-hidden px-3 md:gap-10 "
    >
      <h3 className="pageTitles">Skills</h3>
      {/* <h3 className="absolute top-36 uppercase tracking-[3px] text-gray-500 text-sm">
        Hover over a skill for current proficiency
      </h3> */}
      <div className="grid grid-cols-4 gap-5 pt-4 px-5 overflow-y-auto scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
        {skills?.slice(0, skills.length / 2).map((skill) => (
          <SkillIcon key={skill._id} skill={skill} />
        ))}
        {skills?.slice(skills.length / 2, skills.length).map((skill) => (
          <SkillIcon key={skill._id} skill={skill} directionLeft />
        ))}
      </div>
    </motion.div>
  );
};

export default Skills;
