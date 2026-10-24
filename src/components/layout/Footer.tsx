import Link from "next/link";
import { routes, site, socials } from "@/data/site";
import { iconSkills } from "@/data/skills";
import { externalLinkProps } from "@/lib/links";
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
      className="text-muted overflow-hidden mask-x-from-90% mask-x-to-100% py-5 motion-reduce:hidden"
    >
      <div className="marquee-track flex w-max hover:[animation-play-state:paused]">
        <IconRow />
        <IconRow hidden />
      </div>
    </div>
    <Container className="border-line text-muted flex flex-col items-center gap-3.5 border-t border-dashed pt-4.5 pb-8 text-sm sm:flex-row sm:justify-between">
      <span>
        © {new Date().getFullYear()} {site.name} · {site.handle}
      </span>
      <nav aria-label="Elsewhere" className="flex items-center gap-1.5">
        {socials.map((social) => (
          <Link
            key={social.id}
            href={social.url}
            {...externalLinkProps(social.url)}
            title={social.title}
            aria-label={social.title}
            className="text-ink hover:bg-paper hover:text-accent grid size-10 place-items-center rounded-[10px] transition-colors"
          >
            <social.icon aria-hidden="true" className="size-5" />
          </Link>
        ))}
        <Link href={routes.privacy} className="hover:text-ink px-2.5">
          Privacy
        </Link>
      </nav>
    </Container>
  </footer>
);
