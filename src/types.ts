import type { IconType } from "react-icons";

export type PageInfo = {
  name: string;
  role: string;
  tagline: string;
  location: string;
  email: string;
  about: string[];
  heroImage: string;
  profileImage: string;
};

export type Social = {
  id: string;
  title: string;
  url: string;
};

export type Skill = {
  id: string;
  title: string;
  icon: IconType;
};

export type SkillGroup = {
  id: string;
  title: string;
  skills: Skill[];
};

export type Experience = {
  id: string;
  jobTitle: string;
  company: string;
  dateStarted: string;
  dateEnded: string | null;
  description: string;
  points: string[];
  technologies: Skill[];
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  image: string;
  linkToBuild?: string;
  linkToGithub?: string;
  technologies: Skill[];
};
