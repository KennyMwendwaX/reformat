import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import TanstackProvider from "@/providers/tanstack-provider";

export const metadata: Metadata = {
  title: "Reformat",
  description: "Transform your files with our intelligent conversion tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <TanstackProvider>{children}</TanstackProvider>
      </body>
    </html>
  );
}
