import { motion } from "framer-motion";
import React from "react";

type Props = {};

const BackgroundCircles = (props: Props) => {
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
      <div className="absolute mt-52 h-[200px] w-[200px] animate-ping rounded-full border border-[#333333]" />
      <div className="absolute mt-52 h-[300px] w-[300px] rounded-full border border-[#333333] " />
      <div className="absolute mt-52 h-[500px] w-[500px] rounded-full border border-[#333333] " />

      <div className="absolute mt-52 h-[650px] w-[650px] animate-pulse rounded-full border border-[#f7ab0a] opacity-20" />
      <div className="absolute mt-52 h-[800px] w-[800px] rounded-full border border-[#333333] " />
      <div />
    </motion.div>
  );
};

export default BackgroundCircles;
