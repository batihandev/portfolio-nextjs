import Header from "@/componenets/Header";
import Hero from "@/componenets/Hero";
import About from "@/componenets/About";
import WorkExperience from "@/componenets/WorkExperience";
import Skills from "@/componenets/Skills";
import Projects from "@/componenets/Projects";
import ContactMe from "@/componenets/ContactMe";
import { ArrowSmallUpIcon } from "@heroicons/react/24/outline";
import { Experience, PageInfo, Project, Skill, Social } from "typings";
import { fetchPageInfo } from "@/utils/fetchPageInfo";
import { fetchExperiences } from "@/utils/fetchExperiences";
import { fetchSocials } from "@/utils/fetchSocials";
import { fetchSkills } from "@/utils/fetchSkills";
import { fetchProjects } from "@/utils/fetchProjects";
import React from "react";

type Props = {
  pageInfo: PageInfo;
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  socials: Social[];
};

export default async function Home() {
  try {
    const { socials, pageInfo, skills, projects, experiences }: Props =
      await getData();
    return (
      <div className="bg-[rgb(36,36,36)] scroll-smooth text-white h-screen snap-y snap-mandatory  z-0 overflow-y-scroll overflow-x-hidden scrollbar scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
        <Header socials={socials} />

        <section id="hero" className="snap-center">
          <Hero pageInfo={pageInfo} />
        </section>
        <section id="about" className="snap-center">
          <About pageInfo={pageInfo} />
        </section>
        {/* <section id="experience" className="snap-center">
          <WorkExperience experiences={experiences} />
        </section> */}
        <section id="skills" className="snap-start">
          <Skills skills={skills} />
        </section>
        <section id="projects" className="snap-start">
          <Projects projects={projects} />
        </section>
        <section id="contact" className="snap-start">
          <ContactMe pageInfo={pageInfo} />
        </section>
        <a href="#hero">
          <footer className="sticky bottom-5 w-full cursor-pointer">
            <div className="flex items-center justify-center">
              <ArrowSmallUpIcon className="h-10 w-10 rounded-full bg-[#F7AB0A] opacity-10 hover:opacity-100 transition-opacity duration-150 ease-in-out" />
            </div>
          </footer>
        </a>
      </div>
    );
  } catch (e) {
    console.log(e);
    return <div>Base url error</div>;
  }
}

export const getData = async () => {
  const pageInfo: PageInfo = await fetchPageInfo();
  const experiences: Experience[] = await fetchExperiences();
  const socials: Social[] = await fetchSocials();
  const skills: Skill[] = await fetchSkills();
  const projects: Project[] = await fetchProjects();

  return {
    pageInfo,
    experiences,
    socials,
    skills,
    projects,
  };
};
