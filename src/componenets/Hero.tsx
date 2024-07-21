"use client";
import Image from "next/image";
import React from "react";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import BackgroundCircles from "./BackgroundCircles";
import { PageInfo } from "typings";
import urlFor from "sanityhelper";

type Props = {
  pageInfo: PageInfo;
};

const Hero = ({ pageInfo }: Props) => {
  const [text, count] = useTypewriter({
    words: [`Hi, The Name's ${pageInfo?.name}`, "Welcome To My Portfolio"],
    loop: true,
    delaySpeed: 2000,
  });
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-8 overflow-hidden text-center">
      <BackgroundCircles />

      <Image
        className="relative mx-auto h-32 w-32 rounded-full object-cover"
        src={urlFor(pageInfo?.heroImage).url()}
        width={512}
        height={512}
        priority={true}
        alt="Batıhan Özdemir"
      />

      <div className="z-20 px-4">
        <h2 className="pb-2 text-sm uppercase tracking-[15px] text-gray-500">
          {pageInfo?.role}
        </h2>
        <h1>
          <span className="scroll-px-10 text-4xl font-semibold md:text-5xl lg:text-6xl">
            {text}
          </span>
          <Cursor cursorColor="#f7ab0a" />
        </h1>
        <div className="pt-5">
          <a href="#about" aria-label="About Batıhan Özdemir">
            <button className="heroButtons">About</button>
          </a>
          {/* <a href="#experience">
            <button className="heroButtons">Experience</button>
          </a> */}
          <a href="#skills" aria-label="Batıhan Özdemir's Skills">
            <button className="heroButtons">Skills</button>
          </a>
          <a href="#projects" aria-label="Batıhan Özdemir's Projects">
            <button className="heroButtons">Projects</button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
