import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpsAI - AI Content & Operations Assistant",
  description: "A multi-agent AI productivity platform for college teams, clubs, and admin workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ backgroundColor: '#07071a', color: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  );
}
