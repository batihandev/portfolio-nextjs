"use client";
import Image from "next/image";
import React from "react";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import BackgroundCircles from "./BackgroundCircles";
import { PageInfo } from "typings";
import { urlFor } from "../../sanity";

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
    <div className="h-screen flex flex-col space-y-8 items-center justify-center text-center overflow-hidden">
      <BackgroundCircles />

      <Image
        className="relative rounded-full mx-auto object-cover w-32 h-32"
        src={urlFor(pageInfo?.heroImage).url()}
        width={512}
        height={512}
        priority={true}
        alt="My Profile"
      />

      <div className="z-20">
        <h2 className="text-sm uppercase text-gray-500 pb-2 tracking-[15px]">
          {pageInfo?.role}
        </h2>
        <h1>
          <span className="text-5xl lg:text-6xl font-semibold scroll-px-10">
            {text}
          </span>
          <Cursor cursorColor="#f7ab0a" />
        </h1>
        <div className="pt-5">
          <a href="#about">
            <button className="heroButtons">About</button>
          </a>
          <a href="#experience">
            <button className="heroButtons">Experience</button>
          </a>
          <a href="#skills">
            <button className="heroButtons">Skills</button>
          </a>
          <a href="#projects">
            <button className="heroButtons">Projects</button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
