import { roles, workAreas } from "@/data/experience";
import { projects } from "@/data/projects";
import { receiptCode } from "@/data/receipt";
import { routes, site } from "@/data/site";
import { yearsSince } from "@/lib/dates";
import { getLatestDevlog } from "@/lib/devlog";
import { qrModules } from "@/lib/qr";
import { ProjectKind } from "@/types";
import { DevlogPanel } from "@/components/home/DevlogPanel";
import { HeroReceipt } from "@/components/home/HeroReceipt";
import { RoleEntry } from "@/components/RoleEntry";
import { LinkButton } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Heading";
import { Container } from "@/components/ui/Container";
import { Receipt } from "@/components/ui/Receipt";
import { Section } from "@/components/ui/Section";
import { Ticket } from "@/components/ui/Ticket";

const stripColors = ["border-strip-1", "border-strip-2", "border-strip-3"] as const;
const homeRoles = roles.slice(0, 3);
const games = projects.filter((p) => p.kind === ProjectKind.mobileGame).length;
const qr = qrModules(receiptCode.url);

export default async function HomePage() {
  const devlog = await getLatestDevlog();

  return (
    <main>
      <Container>
        <div className="grid gap-10 py-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-start md:gap-8">
          <div>
            <h1 className="font-display text-[clamp(38px,6vw,62px)] leading-[1.02] font-extrabold tracking-tighter">
              Backend engineer.
              <br />
              <span className="text-accent">{site.tagline}</span>
            </h1>
            <p className="mt-4 max-w-[560px] text-lg text-muted">
              I design and build backend systems, with recent work in payments and online ordering. I share my game
              development on YouTube.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <LinkButton href={routes.projects}>See my work</LinkButton>
              <LinkButton href={routes.experience} variant="secondary">
                Experience
              </LinkButton>
            </div>
          </div>
          <HeroReceipt games={games} apps={projects.length - games} devlogEpisodes={devlog?.number ?? null} qr={qr} />
        </div>

        <Section
          title="What I do at work"
          intro="I take a short list of requirements and turn it into a working system, from the plan to the live product."
        >
          <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            {workAreas.map((area, i) => (
              <div key={area.id} className={`border-t-6 bg-paper px-5.5 py-5 shadow-paper ${stripColors[i % stripColors.length]}`}>
                <span className="font-mono text-xs tracking-[0.08em] text-muted">ITEM {String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-1 text-lg font-bold">{area.title}</h3>
                <p className="mt-1 text-[15px] text-muted">{area.summary}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Experience" intro={`${yearsSince(site.since.professional)}+ years as a professional developer.`}>
          <Receipt className="px-7 pt-7 pb-10 text-[15px]">
            {homeRoles.map((role) => (
              <RoleEntry key={role.id} role={role}>
                {role.summary}
              </RoleEntry>
            ))}
          </Receipt>
          <LinkButton href={routes.experience} variant="secondary" className="mt-5">
            Full experience and skills →
          </LinkButton>
        </Section>

        <Section
          id="projects"
          title="Things I'm building"
          intro="Games, apps and tools I build outside work."
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Ticket key={project.id} project={project} index={i} />
            ))}
          </div>
        </Section>

        <section className="grid gap-6 py-11 md:grid-cols-2">
          <DevlogPanel episode={devlog} />
          <Receipt className="font-sans">
            <SectionTitle>Say hello</SectionTitle>
            <p className="mt-1 mb-4 text-muted">
              Want to chat about something? Send me a message, or email{" "}
              <a href={`mailto:${site.email}`} className="text-ink underline underline-offset-4">
                {site.email}
              </a>
              .
            </p>
            <LinkButton href={routes.contact}>Contact me</LinkButton>
          </Receipt>
        </section>
      </Container>
    </main>
  );
}
