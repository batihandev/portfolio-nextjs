import type { MetadataRoute } from "next";
import { routes, site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}${routes.experience}`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}${routes.contact}`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${site.url}${routes.privacy}`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
