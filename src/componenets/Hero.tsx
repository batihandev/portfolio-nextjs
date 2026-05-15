"use client";
import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { pageInfo } from "@/data";

const BackgroundCircles = dynamic(() => import("./BackgroundCircles"), {
  ssr: false,
});

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

const FIRST_NAME = pageInfo.name.split(" ")[0] ?? pageInfo.name;
const GREETING = `Hi, the name's ${FIRST_NAME}.`;
const TYPEWRITER_WORDS = [
  "Mostly backend, occasionally frontend.",
  "TypeScript. Node.js. Postgres. Redis.",
  "Available for contract work.",
];

const subscribe = () => () => {};
const useIsHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const TypewriterLine = () => {
  const [text] = useTypewriter({
    words: TYPEWRITER_WORDS,
    loop: true,
    delaySpeed: 2500,
  });
  return (
    <>
      <span>{text}</span>
      <Cursor cursorColor="#f7ab0a" />
    </>
  );
};

const Hero = () => {
  const hydrated = useIsHydrated();

  return (
    <div className="flex h-svh flex-col items-center justify-center space-y-8 overflow-hidden text-center">
      <BackgroundCircles />

      <Image
        className="relative mx-auto h-32 w-32 rounded-full object-cover"
        src={pageInfo.heroImage}
        width={256}
        height={256}
        priority
        fetchPriority="high"
        sizes="128px"
        alt={`${pageInfo.name} — ${pageInfo.role}`}
      />

      <div className="z-20 px-4">
        <p className="pb-2 text-sm uppercase tracking-[15px] text-gray-400">
          {pageInfo.role}
        </p>
        <h1 className="text-4xl font-semibold md:text-5xl lg:text-6xl">
          <span className="sr-only">
            {pageInfo.name} — {pageInfo.role}.{" "}
          </span>
          <span aria-hidden="true">{GREETING}</span>
        </h1>
        <p className="mt-3 min-h-6 text-base text-accent md:text-lg">
          {hydrated ? <TypewriterLine /> : TYPEWRITER_WORDS[0]}
        </p>
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
