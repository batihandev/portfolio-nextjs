"use client";
import { motion } from "motion/react";
import { FaGithub, FaLinkedin, FaXTwitter, FaEnvelope } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { socials } from "@/data";

const socialIconMap: Record<string, IconType> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  x: FaXTwitter,
};

const Header = () => {
  return (
    <header className="sticky top-0 z-20 mx-auto flex max-w-7xl items-start justify-between overflow-hidden px-5 py-3 md:py-5 xl:items-center">
      <motion.div
        initial={{ x: -500, opacity: 0, scale: 0.5 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-row items-center gap-3"
      >
        {socials.map((social) => {
          const Icon = socialIconMap[social.id];
          if (!Icon) return null;
          return (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="me noopener noreferrer"
              aria-label={social.title}
              className="text-gray-400 transition-colors hover:text-accent"
            >
              <Icon className="h-7 w-7 md:h-8 md:w-8" />
            </a>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ x: 500, scale: 0.5, opacity: 0 }}
        animate={{ x: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex cursor-pointer flex-row items-center gap-2 text-gray-300"
      >
        <a
          href="#contact"
          aria-label="Get in touch"
          className="flex items-center gap-2 text-gray-400 transition-colors hover:text-accent"
        >
          <FaEnvelope className="h-7 w-7 md:h-8 md:w-8" />
          <span className="hidden text-sm uppercase md:inline-flex">
            Get in touch
          </span>
        </a>
      </motion.div>
    </header>
  );
};

export default Header;
