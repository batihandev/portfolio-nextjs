import { Experience } from "typings";

export const fetchExperiences = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getExperience`,
      { next: { revalidate: 2000 } }
    );
    const data = await res.json();
    const experiences: Experience[] = data.experiences;

    //   console
    return experiences;
  } catch {
    const res = await fetch(`/api/getExperience`, {
      next: { revalidate: 2000 },
    });
    const data = await res.json();
    const experiences: Experience[] = data.experiences;

    //   console
    return experiences;
  }
};
