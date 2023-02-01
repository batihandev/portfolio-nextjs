"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import { urlFor } from "../../sanity";
import { PageInfo } from "typings";
import nobgmeBig from "../assets/images/nobgmeBig.png";

type Props = { pageInfo: PageInfo };

const About = ({ pageInfo }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="h-screen flex relative flex-col text-center md:text-left md:flex-row max-w-7xl px-10 justify-center mx-auto items-center"
    >
      <h3 className="absolute top-24 uppercase tracking-[20px] text-gray-500 text-2xl">
        About
      </h3>
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="flex-shrink-0 mb-10 md:mb-0 w-56 h-56  md:w-64 md:h-95 xl:w-[500px] xl:h-[600px]"
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
      <div className="space-y-10 px-0 md:px-10">
        <h4 className="text-4xl font-semibold">
          Here is{" "}
          <span className="underline decoration-[#f7ab0a]/50">little</span>{" "}
          background
        </h4>
        <p className="text-md">{pageInfo?.backgroundInformation}</p>
      </div>
    </motion.div>
  );
};

export default About;
