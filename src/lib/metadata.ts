import type { Metadata } from "next";
import { alt as imageAlt, size as imageSize } from "@/app/opengraph-image";
import { site } from "@/data/site";

type PageMeta = {
  title: string;
  description: string;
  /** The page's path, such as "/experience"; made absolute through the root's metadataBase. */
  path: string;
  /** Use the title without the root's " | name" template, as the home page does. */
  absoluteTitle?: boolean;
};

// A page's own openGraph and twitter replace the root's, image included, so the site image is named again.
const image = { url: "/opengraph-image", ...imageSize, alt: imageAlt };

/** A page's title, description, canonical URL and share card. */
export function pageMetadata({ title, description, path, absoluteTitle = false }: PageMeta): Metadata {
  const shareTitle = absoluteTitle ? title : `${title} | ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.name,
      title: shareTitle,
      description,
      locale: "en_US",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      site: `@${site.handle}`,
      creator: `@${site.handle}`,
      title: shareTitle,
      description,
      images: [image],
    },
  };
}
