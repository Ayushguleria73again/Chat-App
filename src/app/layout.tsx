import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real-time AI Chat",
  description: "A production-style real-time chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
