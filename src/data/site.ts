import { FaLinkedinIn } from "react-icons/fa6";
import { SiGithub, SiX, SiYoutube } from "react-icons/si";
import type { Social } from "@/types";

export const site = {
  name: "Batıhan Özdemir",
  firstName: "Batıhan",
  familyName: "Özdemir",
  handle: "batihandev",
  developerName: "BatihanDev",
  role: "Backend Engineer",
  url: "https://batihanozdemir.com",
  email: "contact@batihan.dev",
  location: { city: "Tekirdağ", country: "Turkey", countryCode: "TR" },
  languages: ["English", "Turkish"],
  since: { professional: "2023-04", software: "2021" },
  tagline: "I also make games and apps.",
  headline: "Backend engineer. I also make games and apps.",
  description:
    "Batıhan Özdemir is a backend engineer who designs and builds production systems, most recently for payments and online ordering. He also makes games and apps.",
  youtube: {
    url: "https://www.youtube.com/@BatihanDev",
    channelId: "UCbiLCZhtIqbwBXgDxuXXOEw",
  },
} as const;

export const routes = {
  home: "/",
  experience: "/experience",
  projects: "/#projects",
  contact: "/contact",
  privacy: "/privacy",
} as const;

export const navLinks = [
  { label: "Experience", href: routes.experience },
  { label: "Projects", href: routes.projects },
  { label: "Devlog", href: site.youtube.url },
  { label: "Contact", href: routes.contact },
] as const;

export const socials: Social[] = [
  { id: "github", title: "GitHub", url: "https://github.com/batihandev", icon: SiGithub },
  { id: "linkedin", title: "LinkedIn", url: "https://www.linkedin.com/in/batihandev", icon: FaLinkedinIn },
  { id: "youtube", title: "YouTube", url: site.youtube.url, icon: SiYoutube },
  { id: "x", title: "X", url: "https://x.com/batihandev", icon: SiX },
];
