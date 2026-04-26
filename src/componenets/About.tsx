"use client";
import { motion } from "motion/react";
import Image from "next/image";
import { pageInfo } from "@/data";

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative mx-auto flex h-svh max-w-7xl flex-col items-center justify-start px-5 text-center md:text-left"
    >
      <h1 className="pageTitles">About</h1>
      <div className="diff-from-title mx-auto flex max-w-7xl flex-col items-center overflow-auto px-5 py-5 text-center scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-accent md:flex-row md:text-left">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="h-36 w-36 shrink-0 sm:h-44 sm:w-44 md:mb-0 md:w-64 xl:h-150 xl:w-125"
        >
          <Image
            src={pageInfo.profileImage}
            alt={pageInfo.name}
            width={600}
            height={600}
            className="rounded-full object-cover"
          />
        </motion.div>
        <div className="space-y-3 px-0 sm:space-y-6 md:px-10">
          <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
            A little{" "}
            <span className="underline decoration-accent/50">background</span>
          </h2>
          {pageInfo.about.map((paragraph, i) => (
            <p key={i} className="text-sm sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default About;
