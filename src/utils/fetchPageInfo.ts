import { PageInfo } from "typings";

export const fetchPageInfo = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getPageInfo`,
      { next: { revalidate: 2000 } }
    );
    const data = await res.json();
    const pageInfo: PageInfo = data.pageInfo;

    //   console
    return pageInfo;
  } catch {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SECOND_URL}/api/getPageInfo`,
      { next: { revalidate: 2000 } }
    );
    const data = await res.json();
    const pageInfo: PageInfo = data.pageInfo;

    //   console
    return pageInfo;
  }
};
