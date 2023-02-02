"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import urlFor from "sanityhelper";
import { Skill } from "typings";

type Props = {
  directionLeft?: boolean;
  skill: Skill;
};

const SkillIcon = ({ directionLeft, skill }: Props) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: directionLeft ? -50 : 50,
      }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className=""
    >
      <Image
        className="rounded-full  object-cover w-12 h-12 sm:w-20 sm:h-20 xl:w-32 xl:h-32 filter cursor-pointer hover:grayscale transition duration-300 ease-in-out md:w-28 md:h-28"
        src={urlFor(skill?.image).url()}
        alt={skill?.title}
        width={128}
        height={128}
      />
    </motion.div>
  );
};

export default SkillIcon;
