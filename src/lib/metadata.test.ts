import { describe, expect, it } from "vitest";
import { site } from "@/data/site";
import { pageMetadata } from "./metadata";

describe("pageMetadata", () => {
  const meta = pageMetadata({ title: "Experience", description: "Work history.", path: "/experience" });

  it("gives the page its own title, description and canonical path", () => {
    expect(meta.title).toBe("Experience");
    expect(meta.description).toBe("Work history.");
    expect(meta.alternates?.canonical).toBe("/experience");
  });

  it("points the share card at the page itself", () => {
    expect(meta.openGraph).toMatchObject({
      url: "/experience",
      title: `Experience | ${site.name}`,
      description: "Work history.",
      siteName: site.name,
    });
  });

  it("names the site image again, since a page's openGraph replaces the root's", () => {
    const images = [meta.openGraph?.images, meta.twitter?.images].map((list) => [list].flat()[0]);
    for (const image of images) expect(image).toMatchObject({ url: "/opengraph-image" });
  });

  it("uses the title as it is for the home page", () => {
    const home = pageMetadata({ title: "Home title", description: "d", path: "/", absoluteTitle: true });
    expect(home.title).toEqual({ absolute: "Home title" });
    expect(home.openGraph?.title).toBe("Home title");
  });
});
