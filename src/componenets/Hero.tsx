"use client";
import Image from "next/image";
import React from "react";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import BackgroundCircles from "./BackgroundCircles";
import profilePic from "../assets/images/linkedinpp.jpg";

import Link from "next/link";

type Props = {};

const Hero = (props: Props) => {
  const [text, count] = useTypewriter({
    words: ["Hi, The Name's Batıhan Özdemir", "Welcome To My Portfolio"],
    loop: true,
    delaySpeed: 2000,
  });
  return (
    <div className="h-screen flex flex-col space-y-8 items-center justify-center text-center overflow-hidden">
      <BackgroundCircles />

      <Image
        className="relative rounded-full mx-auto object-cover"
        src={profilePic}
        width={128}
        height={128}
        alt="My Profile"
      />

      <div className="z-20">
        <h2 className="text-sm uppercase text-gray-500 pb-2 tracking-[15px]">
          Software Engineer
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
