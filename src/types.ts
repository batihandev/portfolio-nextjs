import type { IconType } from "react-icons";

export type Link = { label: string; href: string };

export type Social = { id: string; title: string; url: string; icon: IconType };

export type Skill = { id: string; title: string; icon?: IconType };

export type SkillGroup = { id: string; title: string; skills: Skill[] };

export type Role = {
  id: string;
  title: string;
  company: string;
  start: string;
  end: string | null;
  summary: string;
  points: string[];
};

export type Education = { degree: string; school: string; start: string; end: string };

export const ProjectKind = {
  mobileGame: "Mobile game",
  mobileApp: "Mobile app",
  webApp: "Web app",
  developerTool: "Developer tool",
} as const;
export type ProjectKind = (typeof ProjectKind)[keyof typeof ProjectKind];

export const ProjectStatus = {
  live: "Live",
  comingSoon: "Coming soon",
  inDevelopment: "In development",
  privateBuild: "Private build",
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export type Project = {
  id: string;
  title: string;
  kind: ProjectKind;
  status: ProjectStatus;
  summary: string;
  link?: Link;
};

export type WorkArea = { id: string; title: string; summary: string };

export type DevlogEpisode = { title: string; url: string; thumbnail: string; number: number | null };
