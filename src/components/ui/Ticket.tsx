"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import type { Project } from "@/types";

const colors = ["bg-ticket-1", "bg-ticket-2", "bg-ticket-3", "bg-ticket-4", "bg-ticket-5"] as const;

const vertical = "rotate-180 font-mono text-xs font-bold tracking-[0.14em] whitespace-nowrap uppercase [writing-mode:vertical-rl]";

type Props = { project: Project; index: number };

// Hover or focus tears the stub away; on touch, a tap on the ticket toggles it and a second tap opens the link.
export const Ticket = ({ project, index }: Props) => {
  const [torn, setTorn] = useState(false);
  const color = colors[index % colors.length];

  const toggle = (event: MouseEvent) => {
    const touch = (event.nativeEvent as PointerEvent).pointerType === "touch";
    if (touch && !(event.target instanceof HTMLAnchorElement)) setTorn((t) => !t);
  };

  return (
    <article
      data-torn={torn || undefined}
      onClick={toggle}
      className="ticket relative grid grid-cols-[1fr_var(--stub)] text-ink drop-shadow-paper hover:z-10 focus-within:z-10 data-torn:z-10"
    >
      <div className={clsx("ticket-body flex flex-col gap-2 py-4.5 pr-4.5 pl-5", color)}>
        <span className="font-mono text-[11px] tracking-[0.12em] uppercase opacity-75">
          No. {String(index + 1).padStart(3, "0")} · {project.kind}
        </span>
        <h3 className="font-display text-[26px] leading-tight font-extrabold tracking-tight">{project.title}</h3>
        <p className="text-[14.5px] leading-snug">{project.summary}</p>
      </div>
      <div className="relative">
        <div className={clsx("ticket-stub ticket-stub-cut absolute inset-0 z-10 grid place-items-center border-l-2 border-dashed border-ink/35", color)}>
          <span className={vertical}>{project.status}</span>
        </div>
        <div className="ticket-stub-cut absolute inset-0 grid place-items-center border-l-2 border-dashed border-line bg-paper">
          {project.link ? (
            <Link href={project.link.href} target="_blank" rel="noreferrer" className={clsx(vertical, "underline underline-offset-4")}>
              {project.link.label} →
            </Link>
          ) : (
            <span className={clsx(vertical, "text-muted")}>Stay tuned</span>
          )}
        </div>
      </div>
    </article>
  );
};
