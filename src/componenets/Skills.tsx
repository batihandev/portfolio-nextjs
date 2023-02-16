"use client";
import { animate, motion } from "framer-motion";
import React, { Children } from "react";
import { Skill } from "typings";
import SkillIcon from "./SkillIcon";

type Props = { skills: Skill[] };

const Skills = ({ skills }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="md:Text-left relative mx-auto flex h-screen min-h-screen max-w-[2000px] flex-col items-center justify-start overflow-hidden px-3 text-center md:gap-10 xl:space-y-0 xl:px-10 "
    >
      <h3 className="pageTitles">Skills</h3>
      {/* <h3 className="absolute top-36 uppercase tracking-[3px] text-gray-500 text-sm">
        Hover over a skill for current proficiency
      </h3> */}
      <motion.div
        initial={{ opacity: 0, x: 200 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="my-auto grid grid-cols-4 gap-5 overflow-y-auto px-5 pt-4 overflow-x-hidden scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80"
      >
        {skills?.slice(0, skills.length / 2).map((skill) => (
          <SkillIcon key={skill._id} skill={skill} />
        ))}
        {skills?.slice(skills.length / 2, skills.length).map((skill) => (
          <SkillIcon key={skill._id} skill={skill} directionLeft />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Skills;
