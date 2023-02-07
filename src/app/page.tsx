import { Experience, PageInfo, Project, Skill, Social } from "typings";
import { fetchPageInfo } from "@/utils/fetchPageInfo";
import { fetchExperiences } from "@/utils/fetchExperiences";
import { fetchSocials } from "@/utils/fetchSocials";
import { fetchSkills } from "@/utils/fetchSkills";
import { fetchProjects } from "@/utils/fetchProjects";
import React from "react";
import Home from "@/componenets/Home";

type Props = {
  pageInfo: PageInfo;
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  socials: Social[];
};

export default async function App() {
  try {
    const { socials, pageInfo, skills, projects, experiences }: Props =
      await getData();
    return (
      <Home
        socials={socials}
        pageInfo={pageInfo}
        skills={skills}
        projects={projects}
        experiences={experiences}
      />
    );
  } catch (e) {
    console.log(e);
    return <header>Base url error</header>;
  }
}

const getData = async () => {
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
