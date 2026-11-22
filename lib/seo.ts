import type { Metadata } from "next";

export const SITE_URL = "https://sficusatapp.vercel.app";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, SITE_URL).toString();
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url,
      title: title + " | SFI CUSAT",
      description,
      siteName: "SFI CUSAT",
    },
  };
}

export function noIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}
