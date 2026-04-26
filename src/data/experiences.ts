import type { Experience } from "@/types";
import { skills } from "./skills";

export const experiences: Experience[] = [
  {
    id: "current-backend",
    jobTitle: "Backend Engineer",
    company: "Undisclosed",
    dateStarted: "2025-07-01",
    dateEnded: null,
    description:
      "Production backend systems across multiple internal products and platforms.",
    points: [
      "Built a swap backend handling concurrent transactions with consistency guarantees and idempotent processing.",
      "Extended scope into a multi-tenant food-delivery SaaS: NestJS backend, license / subscription API, and admin tooling for branded storefronts.",
      "Optimized hot-path database queries, dropping response times from ~17s to ~200ms and CPU usage from ~60% to ~12%.",
      "Built a multi-chain wallet / payment tracker (ETH and BSC, native + ERC-20) with provider fallback, canonical deduplication, and per-project failure isolation.",
      "Integrated external payment providers with idempotent webhook callback handling and HMAC-signed delivery.",
      "Deployed services on AWS (EC2, Aurora) with secrets-manager-backed payout flow and mainnet smoke tests.",
    ],
    technologies: [
      skills.typescript,
      skills.nestjs,
      skills.postgres,
      skills.redis,
      skills.aws,
      skills.docker,
    ],
  },
  {
    id: "clicker-games",
    jobTitle: "Project Lead Developer",
    company: "Clicker Games",
    dateStarted: "2024-03-01",
    dateEnded: "2025-07-01",
    description:
      "Led backend architecture and team coordination for Telegram mini-app games supporting 100,000+ users.",
    points: [
      "Designed a multi-bot architecture (main bot + sibling bots + admin panel) with shared JWT auth and MongoDB-backed grammY storage.",
      "Built Hono services for Telegram webhook handling alongside the main Fastify + Prisma backend.",
      "Integrated Telegram Mini Apps with initData verification, S3 asset storage, and Elasticsearch-backed search.",
      "Built admin dashboards on Nuxt 3 + NuxtHub (Cloudflare Workers) with Pinia and ApexCharts for moderation, analytics, and in-game economy.",
      "Designed APIs and background jobs with RabbitMQ for async processing; tuned concurrency across MongoDB and Prisma.",
    ],
    technologies: [
      skills.fastify,
      skills.hono,
      skills.mongodb,
      skills.prisma,
      skills.rabbitmq,
      skills.nuxt,
      skills.cloudflare,
    ],
  },
  {
    id: "space-clicker",
    jobTitle: "Full Stack Engineer",
    company: "Space Clicker",
    dateStarted: "2023-11-01",
    dateEnded: "2024-03-01",
    description:
      "Backend services and frontend tooling for Telegram mini-app game systems.",
    points: [
      "Built backend services and APIs for game systems on a Telegram mini-app platform.",
      "Implemented Telegram bot logic with grammY and webhook handling on Hono.",
      "Contributed to internal panels and tooling on Vue / Nuxt for game operations.",
    ],
    technologies: [
      skills.fastify,
      skills.hono,
      skills.mongodb,
      skills.vue,
      skills.nuxt,
    ],
  },
  {
    id: "bixos",
    jobTitle: "Frontend Developer",
    company: "Bixos",
    dateStarted: "2023-04-01",
    dateEnded: "2023-12-01",
    description: "Vue / Nuxt web apps and Web3 product work.",
    points: [
      "Built Vue / Nuxt web apps with Node.js, Tailwind, and Git workflows.",
      "Built the frontend for a Web3 NFT app with staking, NFT generation, and sales.",
      "Contributed to a real-estate Web3 project with NFTs for building rentals and admin panel.",
    ],
    technologies: [skills.vue, skills.nuxt, skills.tailwind, skills.node],
  },
  {
    id: "freelance",
    jobTitle: "Freelance Web Developer",
    company: "Freelance / Self-Employed",
    dateStarted: "2022-12-01",
    dateEnded: null,
    description:
      "Ongoing freelance availability for backend / full-stack contract work alongside core role.",
    points: [
      "Open to backend / full-stack contracts in parallel with main employment.",
      "Past projects span React / Next.js and Vue / Nuxt frontends with Node.js backends.",
    ],
    technologies: [
      skills.nestjs,
      skills.react,
      skills.next,
      skills.vue,
      skills.nuxt,
      skills.node,
    ],
  },
];
