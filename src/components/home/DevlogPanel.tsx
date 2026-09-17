import Image from "next/image";
import { site } from "@/data/site";
import { externalLinkProps } from "@/lib/links";
import { LinkButton } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Heading";
import { Receipt } from "@/components/ui/Receipt";
import type { DevlogEpisode } from "@/types";

export const DevlogPanel = ({ episode }: { episode: DevlogEpisode | null }) => (
  <Receipt className="font-sans">
    <SectionTitle>Devlog</SectionTitle>
    <p className="mt-1 mb-4 text-muted">Weekly videos about the games I&apos;m making.</p>
    {episode && (
      <a href={episode.url} {...externalLinkProps(episode.url)} className="mb-4 flex items-center gap-3.5">
        <Image
          src={episode.thumbnail}
          alt=""
          width={120}
          height={68}
          className="h-[68px] w-[120px] flex-none rounded-lg border-2 border-ink object-cover"
        />
        <span className="text-[15px] leading-snug">
          <b>{episode.title}</b>
          {episode.number && <span className="block text-muted">Episode {episode.number}</span>}
        </span>
      </a>
    )}
    <LinkButton href={site.youtube.url}>Watch on YouTube</LinkButton>
  </Receipt>
);
