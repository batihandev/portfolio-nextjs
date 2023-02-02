import { Skill } from "typings";

export const fetchSkills = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getSkills`,
      {
        next: { revalidate: 2000 },
      }
    );
    const data = await res.json();
    const skills: Skill[] = data.skills;

    //   console
    return skills;
  } catch {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SECOND_URL}/api/getSkills`,
      {
        next: { revalidate: 2000 },
      }
    );
    const data = await res.json();
    const skills: Skill[] = data.skills;

    //   console
    return skills;
  }
};
