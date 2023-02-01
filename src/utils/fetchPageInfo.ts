import { PageInfo } from "typings";

export const fetchPageInfo = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getPageInfo`,
      { next: { revalidate: 1000 } }
    );
    const data = await res.json();
    const pageInfo: PageInfo = data.pageInfo;

    //   console
    return pageInfo;
  } catch (e) {
    console.log(e);
    const pageInfo = "Error";
    return pageInfo;
  }
};
