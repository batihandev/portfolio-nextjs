"use client";
import Image from "next/image";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import BackgroundCircles from "./BackgroundCircles";
import { pageInfo } from "@/data";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

const Hero = () => {
  const [text] = useTypewriter({
    words: [
      `Hi, the name's ${pageInfo.name.split(" ")[0]}.`,
      "Mostly backend, occasionally frontend.",
    ],
    loop: true,
    delaySpeed: 2200,
  });

  return (
    <div className="flex h-svh flex-col items-center justify-center space-y-8 overflow-hidden text-center">
      <BackgroundCircles />

      <Image
        className="relative mx-auto h-32 w-32 rounded-full object-cover"
        src={pageInfo.heroImage}
        width={512}
        height={512}
        priority
        alt={pageInfo.name}
      />

      <div className="z-20 px-4">
        <h2 className="pb-2 text-sm uppercase tracking-[15px] text-gray-400">
          {pageInfo.role}
        </h2>
        <h1>
          <span className="scroll-px-10 text-4xl font-semibold md:text-5xl lg:text-6xl">
            {text}
          </span>
          <Cursor cursorColor="#f7ab0a" />
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-400 md:text-base">
          {pageInfo.tagline}
        </p>
        <div className="pt-5">
          {navLinks.map((link) => (
            <a key={link.href} className="heroButtons" href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
