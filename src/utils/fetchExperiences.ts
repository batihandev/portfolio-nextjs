import { Experience } from "typings";

export const fetchExperiences = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getExperience`,
      { next: { revalidate: 1000 } }
    );
    const data = await res.json();
    const experiences: Experience[] = data.experiences;

    //   console
    return experiences;
  } catch (e) {
    console.log(e);
    const experiences = "error";
    return experiences;
  }
};
