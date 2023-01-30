import { Inter } from "@next/font/google";
import Header from "@/componenets/Header";
import Hero from "@/componenets/Hero";
import About from "@/componenets/About";
import WorkExperience from "@/componenets/WorkExperience";
import Skills from "@/componenets/Skills";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="bg-[rgb(36,36,36)] text-white h-screen snap-y snap-mandatory overflow-auto z-0">
      <Header />
      {/* // hero // about // experience // skills // projects // contact me */}
      <section id="hero" className="snap-center">
        <Hero />
      </section>
      <section id="about" className="snap-center">
        <About />
      </section>
      <section id="experience" className="snap-center">
        <WorkExperience />
      </section>
      <section id="skills" className="snap-start">
        <Skills />
      </section>
      <main className={""}>
        <h1 className=""></h1>
      </main>
    </div>
  );
}
