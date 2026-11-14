import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SFI CUSAT | Digital Student Platform",
  description: "Student services, support, resources and culture for CUSAT students. Run by SFI CUSAT.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
