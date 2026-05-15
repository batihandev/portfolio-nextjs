"use client";
import { useTypewriter, Cursor } from "react-simple-typewriter";

type Props = { words: string[]; fallback: string };

const HeroTypewriter = ({ words, fallback }: Props) => {
  const [text] = useTypewriter({
    words,
    loop: true,
    delaySpeed: 2500,
  });
  return (
    <>
      <span>{text || fallback}</span>
      <Cursor cursorColor="#f7ab0a" />
    </>
  );
};

export default HeroTypewriter;
