import { Project } from "typings";

export const fetchProjects = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getProjects`,
      { next: { revalidate: 2000 } }
    );
    const data = await res.json();
    const projects: Project[] = data.projects;

    //   console
    return projects;
  } catch {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SECOND_URL}/api/getProjects`,
      { next: { revalidate: 2000 } }
    );
    const data = await res.json();
    const projects: Project[] = data.projects;

    //   console
    return projects;
  }
};
