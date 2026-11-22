import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://sficusatapp.vercel.app"),
  title: {
    template: "%s | SFI CUSAT",
    default: "SFI CUSAT Digital Student Platform for CUSAT Students",
  },
  description:
    "Student-first resources, academic support, opportunities and campus initiatives for CUSAT students, run by SFI CUSAT and clearly non-official.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
