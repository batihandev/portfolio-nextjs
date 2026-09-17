import Link from "next/link";
import { routes, site, socials } from "@/data/site";
import { iconSkills } from "@/data/skills";
import { Container } from "@/components/ui/Container";

const IconRow = ({ hidden = false }: { hidden?: boolean }) => (
  <div aria-hidden={hidden || undefined} className="flex gap-9 pr-9">
    {iconSkills.map((skill) => (
      <span key={skill.id} title={hidden ? undefined : skill.title}>
        {skill.icon && <skill.icon aria-hidden="true" className="size-7" />}
      </span>
    ))}
  </div>
);

export const Footer = () => (
  <footer className="mt-10">
    <div
      aria-label="Tools I use"
      className="overflow-hidden py-5 text-muted mask-x-from-90% mask-x-to-100% motion-reduce:hidden"
    >
      <div className="marquee-track flex w-max hover:[animation-play-state:paused]">
        <IconRow />
        <IconRow hidden />
      </div>
    </div>
    <Container className="flex flex-col items-center gap-3.5 border-t border-dashed border-line pt-4.5 pb-8 text-sm text-muted sm:flex-row sm:justify-between">
      <span>
        © {new Date().getFullYear()} {site.name} · {site.handle}
      </span>
      <nav aria-label="Elsewhere" className="flex items-center gap-1.5">
        {socials.map((social) => (
          <Link
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            title={social.title}
            aria-label={social.title}
            className="grid size-10 place-items-center rounded-[10px] text-ink transition-colors hover:bg-paper hover:text-accent"
          >
            <social.icon aria-hidden="true" className="size-5" />
          </Link>
        ))}
        <Link href={routes.privacy} className="px-2.5 hover:text-ink">
          Privacy
        </Link>
      </nav>
    </Container>
  </footer>
);
