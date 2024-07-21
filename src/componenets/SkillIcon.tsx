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
        className="h-12  w-12 cursor-pointer rounded-full object-contain filter transition duration-300 ease-in-out hover:grayscale sm:h-20 sm:w-20 md:h-28 md:w-28 xl:h-32 xl:w-32"
        src={urlFor(skill?.image).url()}
        alt={skill?.title}
        width={128}
        height={128}
      />
    </motion.div>
  );
};

export default SkillIcon;
