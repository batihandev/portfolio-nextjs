"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import expPlaceHolder from "../assets/images/exp-placeholder.png";
import { IoLogoJavascript } from "react-icons/io";
import { IoLogoReact } from "react-icons/io5";
import { TbBrandNextjs } from "react-icons/tb";
type Props = {};

const ExperienceCard = (props: Props) => {
  return (
    <article className="flex flex-col rounded-lg items-center space-y-7 flex-shrink-0 w-[500px] md:w-[600px] xl:w-[900px] snap-center bg-[#292929] p-10 opacity-40 hover:opacity-100 cursor-pointer transition-opacity duration-200  overflow-hidden">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        transition={{ duration: 1.2 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-32 h-32 xl:w-[200px] xl:h-[200px]"
      >
        <Image
          className="rounded-full md:rounded-full object-cover object-center"
          src={expPlaceHolder}
          alt=""
          width={200}
          height={200}
        />
      </motion.div>
      <div className="px-0 md:px-10">
        <h4 className="text-4xl font-light">Self Employed</h4>
        <p className="font-bold text-2xl mt-1">Freelancer</p>
        <div className="flex space-x-2 my-2">
          <IoLogoJavascript />
          <IoLogoReact />
          <TbBrandNextjs />
        </div>
        <p className="uppercase py-5 text-gray">Started work...</p>
        <ul className="list-disc space-y-4 ml-5 text-lg">
          <li>Summary points</li>
          <li>Summary points</li>
          <li>Summary points</li>
          <li>Summary points</li>
          <li>Summary points</li>
        </ul>
      </div>
    </article>
  );
};

export default ExperienceCard;
