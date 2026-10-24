import type { Skill } from "@/types";

export const Chip = ({ skill }: { skill: Skill }) => (
  <span className="border-line bg-paper inline-flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-semibold">
    {skill.icon && <skill.icon aria-hidden="true" className="size-4" />}
    {skill.title}
  </span>
);
