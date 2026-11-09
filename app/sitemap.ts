import type { MetadataRoute } from "next";

const BASE = "https://heliosbarber.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terminos`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
