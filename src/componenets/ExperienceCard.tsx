import type { Experience } from "@/types";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

const formatRange = (start: string, end: string | null) => {
  const startLabel = dateFmt.format(new Date(start));
  const endLabel = end ? dateFmt.format(new Date(end)) : "Present";
  return `${startLabel} - ${endLabel}`;
};

type Props = { experience: Experience };

const ExperienceCard = ({ experience }: Props) => {
  return (
    <article className="card-glow-y flex h-full w-full shrink-0 snap-center flex-col overflow-hidden rounded-lg bg-surface-2 p-5">
      <div className="flex h-full flex-col space-y-2 overflow-y-auto px-0 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-accent md:px-10">
        <div>
          <h2 className="text-4xl font-light">{experience.jobTitle}</h2>
          <p className="mt-1 text-2xl font-bold">{experience.company}</p>
          <div className="my-2 flex flex-wrap items-center gap-3">
            {experience.technologies.map((tech) => {
              const Icon = tech.icon;
              return (
                <Icon
                  key={tech.id}
                  className="h-6 w-6 text-gray-300"
                  aria-label={tech.title}
                  title={tech.title}
                />
              );
            })}
          </div>
          <p className="text-sm uppercase tracking-wider text-gray-400">
            {formatRange(experience.dateStarted, experience.dateEnded)}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-gray-300">{experience.description}</p>
          <ul className="mb-5 ml-5 list-disc space-y-3 pr-3 text-base">
            {experience.points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
};

export default ExperienceCard;
