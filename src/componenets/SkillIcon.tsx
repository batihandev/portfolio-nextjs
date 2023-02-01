"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { urlFor } from "../../sanity";
import { Skill } from "typings";

type Props = {
  directionLeft?: boolean;
  skill: Skill;
};

const SkillIcon = ({ directionLeft, skill }: Props) => {
  return (
    <div className="group relative flex cursor-pointer">
      <motion.div
        initial={{
          x: directionLeft ? -200 : 200,
        }}
        transition={{ duration: 1 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className=""
      >
        <Image
          className="rounded-full border border-gray-500 object-cover w-24 h-24 xl:w-32 xl:h-32 filter group-hover:grayscale transition duration-300 ease-in-out md:w-28 md:h-28"
          src={urlFor(skill?.image).url()}
          alt=""
          width={128}
          height={128}
        />
      </motion.div>
      <div className="absolute opacity-0 group-hover:opacity-80 transition duration-300 ease-in-out group-hover:bg-white w-24 h-24 xl:w-32 xl:h-32 rounded-full md:w-28 md:h-28">
        <p className="text-3xl font-bold text-black opacity-100 flex items-center justify-center h-full">
          {skill?.progress}%
        </p>
      </div>
    </div>
  );
};

export default SkillIcon;
