"use client";
import { useState } from "react";
import { useTypewriter, Cursor } from "react-simple-typewriter";

type Props = { words: string[]; fallback: string };

const HeroTypewriter = ({ words, fallback }: Props) => {
  const [text] = useTypewriter({
    words,
    loop: true,
    delaySpeed: 2500,
  });
  const [hasTyped, setHasTyped] = useState(false);

  if (text && !hasTyped) {
    setHasTyped(true);
  }

  const displayed = hasTyped ? text || " " : fallback;

  return (
    <>
      <span>{displayed}</span>
      <Cursor cursorColor="#f7ab0a" />
    </>
  );
};

export default HeroTypewriter;
