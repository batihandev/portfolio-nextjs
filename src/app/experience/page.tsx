import type { Metadata } from "next";
import { education, roles } from "@/data/experience";
import { site } from "@/data/site";
import { skillGroups } from "@/data/skills";
import { formatRange, yearsSince } from "@/lib/dates";
import { RoleEntry } from "@/components/RoleEntry";
import { Chip } from "@/components/ui/Chip";
import { Container } from "@/components/ui/Container";
import { PageTitle } from "@/components/ui/Heading";
import { Receipt, ReceiptRow, ReceiptRule, ReceiptTitle } from "@/components/ui/Receipt";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Experience",
  description: `Work history and skills of ${site.name}, backend engineer.`,
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <main>
      <Container>
        <div className="max-w-[700px] pt-14 pb-2">
          <PageTitle>Experience</PageTitle>
          <p className="mt-4 text-lg text-muted">
            {yearsSince(site.since.professional)}+ years as a professional developer and {yearsSince(site.since.software)}+
            years building software. Most of my work is on the backend: the systems that take payments, handle orders
            and run games.
          </p>
        </div>

        <div className="grid items-start gap-8 py-11 lg:grid-cols-[1.3fr_1fr]">
          <Receipt className="px-5 pt-7 pb-10 text-[15px] sm:px-7">
            <ReceiptTitle>WORK HISTORY</ReceiptTitle>
            <ReceiptRule />
            {roles.map((role) => (
              <RoleEntry key={role.id} role={role}>
                <ul className="list-disc pl-4.5">
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </RoleEntry>
            ))}
          </Receipt>

          <Receipt>
            <ReceiptTitle>DETAILS</ReceiptTitle>
            <ReceiptRule />
            <ReceiptRow label="Based in" value={site.location.country} />
            <ReceiptRow label="Works" value="Remotely" />
            <ReceiptRow label="Languages" value={site.languages.join(", ")} />
            <ReceiptRule />
            <ReceiptTitle>EDUCATION</ReceiptTitle>
            <ReceiptRule />
            {education.map((item) => (
              <div key={item.degree} className="mb-2">
                <div>{item.degree}</div>
                <div className="text-muted">
                  {item.school} · {formatRange(item.start, item.end)}
                </div>
              </div>
            ))}
          </Receipt>
        </div>

        <Section title="Skills" intro="The tools I use most.">
          <div className="grid gap-5.5">
            {skillGroups.map((group) => (
              <div key={group.id}>
                <h3 className="mb-2.5 font-mono text-[13px] font-bold tracking-[0.1em] text-muted uppercase">{group.title}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {group.skills.map((skill) => (
                    <Chip key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </Container>
    </main>
  );
}
