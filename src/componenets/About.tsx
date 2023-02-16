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
      className="relative mx-auto flex h-screen max-w-7xl flex-col  items-center justify-start px-5 text-center md:text-left"
    >
      <h3 className="pageTitles">About</h3>
      <div className="diff-from-title mx-auto flex max-w-7xl flex-col items-center justify-center overflow-auto px-5 py-5 text-center scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80 md:flex-row md:text-left">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="md:h-95  h-36 w-36 flex-shrink-0 sm:h-44 sm:w-44  md:mb-0 md:w-64 xl:h-[600px] xl:w-[500px]"
        >
          {" "}
          <Image
            src={urlFor(pageInfo?.profilePic).url()}
            alt="Me"
            width={600}
            height={600}
            className="mb:rounded-lg rounded-full object-cover"
          />
        </motion.div>
        <div className="space-y-3 px-0 sm:space-y-10 md:px-10">
          <h4 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
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
