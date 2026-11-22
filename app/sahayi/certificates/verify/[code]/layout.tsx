import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const path = "/sahayi/certificates/verify/" + encodeURIComponent(code);
  const url = new URL(path, SITE_URL).toString();
  const title = "Verify a Sahayi Scribe Certificate";
  const description =
    "Verify a Sahayi scribe certificate using its unique verification code and review the certificate status securely online.";

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

export default function Layout({ children }: Props) {
  return children;
}
