"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import urlFor from "sanityhelper";
import { PageInfo } from "typings";

type Props = { pageInfo: PageInfo };

const About = ({ pageInfo }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="h-screen flex relative flex-col text-center md:text-left  max-w-7xl px-5 justify-start mx-auto items-center"
    >
      <h3 className="pageTitles">About</h3>
      <div className="flex flex-col text-center md:text-left md:flex-row max-w-7xl px-5 justify-center overflow-auto mx-auto items-center diff-from-title scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80 py-5">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="flex-shrink-0  md:mb-0 w-36 h-36 sm:w-44 sm:h-44  md:w-64 md:h-95 xl:w-[500px] xl:h-[600px]"
        >
          {" "}
          <Image
            src={urlFor(pageInfo?.profilePic).url()}
            alt="Me"
            width={600}
            height={600}
            className="object-cover rounded-full mb:rounded-lg "
          />
        </motion.div>
        <div className="space-y-3 sm:space-y-10 px-0 md:px-10">
          <h4 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
            Here is{" "}
            <span className="underline decoration-[#f7ab0a]/50">little</span>{" "}
            background
          </h4>
          <p className="text-sm sm:text-base">
            {pageInfo?.backgroundInformation}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
