import { Social } from "typings";

export const fetchSocials = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getSocials`,
      { next: { revalidate: 2000 } }
    );
    const data = await res.json();
    const socials: Social[] = data.socials;

    //   console
    return socials;
  } catch {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SECOND_URL}/api/getSocials`,
      { next: { revalidate: 2000 } }
    );
    const data = await res.json();
    const socials: Social[] = data.socials;

    //   console
    return socials;
  }
};
