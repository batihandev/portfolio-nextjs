"use client";
import { motion } from "motion/react";
import { skillGroups } from "@/data";
import SkillIcon from "./SkillIcon";

const Skills = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative mx-auto flex h-svh max-w-7xl flex-col items-center justify-start px-5 text-center"
    >
      <h3 className="pageTitles">Skills</h3>
      <div className="diff-from-title grid w-full grid-cols-1 gap-6 overflow-y-auto px-2 pb-10 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-accent md:grid-cols-2 md:gap-8">
        {skillGroups.map((group) => (
          <section
            key={group.id}
            className="rounded-lg bg-surface-2/40 p-5 text-left"
          >
            <h4 className="mb-4 text-xs uppercase tracking-[6px] text-accent">
              {group.title}
            </h4>
            <div className="flex flex-wrap gap-4">
              {group.skills.map((skill) => (
                <SkillIcon key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
};

export default Skills;
