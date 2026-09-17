import type { Education, Role, WorkArea } from "@/types";

export const workAreas: WorkArea[] = [
  {
    id: "payments",
    title: "Payments",
    summary: "Card payments, subscriptions and payouts that keep records correct even when something fails.",
  },
  {
    id: "ordering",
    title: "Online ordering",
    summary:
      "Ordering systems for restaurant brands with many branches: menus, delivery areas, orders and staff dashboards.",
  },
  {
    id: "games",
    title: "Game servers",
    summary: "The servers and admin tools behind an online game played on Telegram.",
  },
];

export const roles: Role[] = [
  {
    id: "backend-engineer",
    title: "Backend Engineer",
    company: "UK company, remote",
    start: "2025-07",
    end: null,
    summary: "Payment and payout systems.",
    points: [
      "Build and run payment systems: card payments and subscriptions, plus blockchain payment tracking and payouts on Ethereum and BSC.",
      "Took over a payments service and now develop it on my own.",
      "Made slow database queries fast again on a busy payments system.",
    ],
  },
  {
    id: "plug-digital",
    title: "Backend Engineer",
    company: "Plug Digital, remote",
    start: "2025-12",
    end: null,
    summary: "An online ordering platform for restaurant brands with many branches.",
    points: [
      "Built the staff dashboard and most of the API behind an online ordering platform for restaurant brands with many branches: menus, delivery areas, orders, card payments and till integration.",
      "Review changes across the product. Also built its licensing service and a CRM.",
    ],
  },
  {
    id: "clicker-games",
    title: "Project Lead Developer",
    company: "Clicker Games",
    start: "2024-03",
    end: "2025-07",
    summary: "Led development of an online game on Telegram, from its servers to its admin tools.",
    points: [
      "Led development of an online game on Telegram, from its servers to its admin tools.",
      "Built the admin panel the team used for moderation, statistics and the in-game economy.",
    ],
  },
  {
    id: "space-clicker",
    title: "Full Stack Engineer",
    company: "Space Clicker",
    start: "2023-11",
    end: "2024-03",
    summary: "Built game servers and the internal panels the team used every day.",
    points: ["Started on the web panels and landing pages, then moved to the game servers."],
  },
  {
    id: "bixos",
    title: "Frontend Developer",
    company: "Bixos",
    start: "2023-04",
    end: "2023-12",
    summary: "Built web apps and the company website.",
    points: ["Built web apps and the company website."],
  },
  {
    id: "freelance",
    title: "Freelance Web Developer",
    company: "",
    start: "2022-12",
    end: null,
    summary: "Open to freelance web projects alongside my main job.",
    points: ["Open to freelance web projects alongside my main job."],
  },
];

export const education: Education[] = [
  { degree: "Management Information Systems", school: "Anadolu University", start: "2022", end: "2025" },
  { degree: "Civil Engineering", school: "Namık Kemal University", start: "2021", end: "2025" },
];
