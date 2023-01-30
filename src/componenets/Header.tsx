"use client";
import { motion } from "framer-motion";
import React from "react";
import { SocialIcon } from "react-social-icons";

type Props = {};

const Header = (props: Props) => {
  return (
    <header className="sticky top-0 flex items-start justify-between max-w-7xl mx-auto z-20 xl:items-center p-5">
      <motion.div
        initial={{ x: -500, opacity: 0, scale: 0.5 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-row items-center"
      >
        {/* social icons */}
        <SocialIcon
          url="https://twitter.com/batihandev"
          fgColor="gray"
          bgColor="transparent"
          target={"_blank"}
        />
        <SocialIcon
          url="https://linkedin.com/in/batihandev"
          fgColor="gray"
          bgColor="transparent"
          target={"_blank"}
        />
        <SocialIcon
          url="https://github.com/batihandev"
          fgColor="gray"
          bgColor="transparent"
          target={"_blank"}
        />
      </motion.div>
      <motion.div
        initial={{ x: 500, scale: 0.5, opacity: 0 }}
        animate={{ x: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-row items-center text-gray-300 cursor-pointer"
      >
        <SocialIcon
          className="cursor-pointer"
          network="email"
          fgColor="gray"
          bgColor="transparent"
        />
        <p className="uppercase hidden md:inline-flex text-sm text-gray-400">
          Get In Touch
        </p>
      </motion.div>
    </header>
  );
};

export default Header;
