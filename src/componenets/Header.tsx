"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { SocialIcon } from "react-social-icons";
import { Social } from "typings";

type Props = {
  socials: Social[];
};

const Header = ({ socials }: Props) => {
  return (
    <header className="sticky top-0 flex items-start justify-between max-w-7xl mx-auto z-20 xl:items-center p-5 overflow-hidden">
      <motion.div
        initial={{ x: -500, opacity: 0, scale: 0.5 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-row items-center"
      >
        {socials.map((social) => (
          <SocialIcon
            key={social._id}
            url={social.url}
            fgColor="gray"
            bgColor="transparent"
            target="_blank"
          />
        ))}
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
          url="#contact"
        />
        <a href="#contact">
          <p className="uppercase hidden md:inline-flex text-sm text-gray-400">
            Get In Touch
          </p>
        </a>
      </motion.div>
    </header>
  );
};

export default Header;
