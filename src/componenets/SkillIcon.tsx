"use client";
import { motion } from "motion/react";
import type { Skill } from "@/types";

type Props = { skill: Skill };

const SkillIcon = ({ skill }: Props) => {
  const Icon = skill.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="group flex w-20 flex-col items-center gap-2 sm:w-24"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2 text-gray-300 transition-colors group-hover:text-accent sm:h-16 sm:w-16">
        <Icon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
      </div>
      <span className="text-center text-xs text-gray-400 sm:text-sm">
        {skill.title}
      </span>
    </motion.div>
  );
};

export default SkillIcon;
