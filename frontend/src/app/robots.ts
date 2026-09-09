import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/student/", "/teacher/"],
    },
    sitemap: "https://eduflow.bd/sitemap.xml",
  };
}
