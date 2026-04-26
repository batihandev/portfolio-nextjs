import {
  SiTypescript,
  SiNodedotjs,
  SiNestjs,
  SiFastify,
  SiHono,
  SiJest,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiPrisma,
  SiRabbitmq,
  SiDocker,
  SiCloudflareworkers,
  SiOllama,
  SiAnthropic,
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiNuxt,
  SiTailwindcss,
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";
import { LuPlug } from "react-icons/lu";
import type { Skill, SkillGroup } from "@/types";

const skill = (id: string, title: string, icon: Skill["icon"]): Skill => ({
  id,
  title,
  icon,
});

export const skills = {
  typescript: skill("typescript", "TypeScript", SiTypescript),
  node: skill("node", "Node.js", SiNodedotjs),
  nestjs: skill("nestjs", "NestJS", SiNestjs),
  fastify: skill("fastify", "Fastify", SiFastify),
  hono: skill("hono", "Hono", SiHono),
  jest: skill("jest", "Jest", SiJest),
  postgres: skill("postgres", "PostgreSQL", SiPostgresql),
  mongodb: skill("mongodb", "MongoDB", SiMongodb),
  redis: skill("redis", "Redis", SiRedis),
  prisma: skill("prisma", "Prisma", SiPrisma),
  rabbitmq: skill("rabbitmq", "RabbitMQ", SiRabbitmq),
  docker: skill("docker", "Docker", SiDocker),
  aws: skill("aws", "AWS", FaAws),
  cloudflare: skill("cloudflare", "Cloudflare Workers", SiCloudflareworkers),
  mcp: skill("mcp", "MCP", LuPlug),
  ollama: skill("ollama", "Ollama", SiOllama),
  claude: skill("claude", "Claude / Agents", SiAnthropic),
  react: skill("react", "React", SiReact),
  next: skill("next", "Next.js", SiNextdotjs),
  vue: skill("vue", "Vue", SiVuedotjs),
  nuxt: skill("nuxt", "Nuxt.js", SiNuxt),
  tailwind: skill("tailwind", "Tailwind", SiTailwindcss),
} satisfies Record<string, Skill>;

export const skillGroups: SkillGroup[] = [
  {
    id: "backend",
    title: "Backend",
    skills: [
      skills.typescript,
      skills.node,
      skills.nestjs,
      skills.fastify,
      skills.hono,
      skills.jest,
    ],
  },
  {
    id: "data",
    title: "Data",
    skills: [
      skills.postgres,
      skills.mongodb,
      skills.redis,
      skills.prisma,
      skills.rabbitmq,
    ],
  },
  {
    id: "infra",
    title: "Infrastructure",
    skills: [skills.docker, skills.aws, skills.cloudflare],
  },
  {
    id: "ai",
    title: "AI Tooling",
    skills: [skills.mcp, skills.ollama, skills.claude],
  },
  {
    id: "frontend",
    title: "Frontend",
    skills: [
      skills.react,
      skills.next,
      skills.vue,
      skills.nuxt,
      skills.tailwind,
    ],
  },
];
