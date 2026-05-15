"use client";
import { useTypewriter, Cursor } from "react-simple-typewriter";

type Props = { words: string[] };

const HeroTypewriter = ({ words }: Props) => {
  const [text] = useTypewriter({
    words,
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

export default HeroTypewriter;
