import { site } from "./site";
import { ProjectKind, ProjectStatus, type Project } from "@/types";

export const projects: Project[] = [
  {
    id: "inevitable",
    title: "INEVITABLE",
    kind: ProjectKind.mobileGame,
    status: ProjectStatus.comingSoon,
    summary: "My mobile game, built in public with a weekly devlog.",
    link: { label: "Devlog", href: site.youtube.url },
  },
  {
    id: "whichway",
    title: "WhichWay",
    kind: ProjectKind.mobileGame,
    status: ProjectStatus.live,
    summary: "A quick hyper-casual game with Google Play leaderboards.",
    link: {
      label: "Play",
      href: "https://play.google.com/store/apps/details?id=com.VexeDev.WhichWay",
    },
  },
  {
    id: "dopamine-shop",
    title: "Dopamine Shop",
    kind: ProjectKind.webApp,
    status: ProjectStatus.inDevelopment,
    summary:
      "A shopping game: the fun of browsing an online shop, without spending real money. It also shows how a real shop works behind the scenes.",
  },
  {
    id: "book-reader",
    title: "Book Reader",
    kind: ProjectKind.mobileApp,
    status: ProjectStatus.privateBuild,
    summary:
      "I read English books every day and other reader apps felt slow for the way I read, so I built my own for Android and iOS.",
  },
  {
    id: "delegate",
    title: "Delegate",
    kind: ProjectKind.developerTool,
    status: ProjectStatus.privateBuild,
    summary:
      "A tool I built to manage my own development work: it queues tasks, tracks their progress and shows everything on a live dashboard.",
  },
];
