"use client";
import { motion } from "framer-motion";
import React from "react";
import { SocialIcon } from "react-social-icons";
import { Social } from "typings";

type Props = {
  socials: Social[];
};

const Header = ({ socials }: Props) => {
  return (
    <header className="sticky top-0 z-20 mx-auto flex max-w-7xl items-start justify-between overflow-hidden py-3 px-5 md:py-5 xl:items-center">
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
            rel="me"
            fgColor="rgb(156 163 175)"
            bgColor="transparent"
            target="_blank"
            className="!h-10 !w-10 md:!h-12 md:!w-12"
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ x: 500, scale: 0.5, opacity: 0 }}
        animate={{ x: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex cursor-pointer flex-row items-center text-gray-300"
      >
        <SocialIcon
          className="!h-10 !w-10 cursor-pointer md:!h-12 md:!w-12"
          network="email"
          fgColor="gray"
          bgColor="transparent"
          url="#contact"
        />
        <a href="#contact" aria-label="Contact Batıhan Özdemir">
          <p className="hidden text-sm uppercase text-gray-400 md:inline-flex">
            Get In Touch
          </p>
        </a>
      </motion.div>
    </header>
  );
};

export default Header;
