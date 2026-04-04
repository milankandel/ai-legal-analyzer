import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "LegalAI Analyzer — AI Contract Intelligence Platform",
  description:
    "Understand any contract in minutes. AI-powered risk analysis, plain English explanations, and negotiation suggestions. For informational purposes only — not legal advice.",
  keywords: ["contract analysis", "legal AI", "risk assessment", "contract review"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased bg-slate-950 text-slate-100">
        <Header />
        {children}
      </body>
    </html>
  );
}
