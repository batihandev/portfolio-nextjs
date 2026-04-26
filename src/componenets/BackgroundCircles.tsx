"use client";
import { motion } from "motion/react";

const BackgroundCircles = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.1, 0.2, 0.4, 0.7, 0.1, 1],
        scale: [1, 2, 2, 3, 1],
        borderRadius: ["20%", "20%", "50%", "80%", "20%"],
      }}
      transition={{ duration: 2.5 }}
      className="relative flex items-center justify-center"
    >
      <div className="absolute mt-52 h-50 w-50 animate-ping rounded-full border border-[#333333]" />
      <div className="absolute mt-52 h-75 w-75 rounded-full border border-[#333333]" />
      <div className="absolute mt-52 h-125 w-125 rounded-full border border-[#333333]" />
      <div className="absolute mt-52 h-[650px] w-[650px] animate-pulse rounded-full border border-accent opacity-20" />
      <div className="absolute mt-52 h-200 w-200 rounded-full border border-[#333333]" />
    </motion.div>
  );
};

export default BackgroundCircles;
