import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATS Resume Builder - Parse-safe, recruiter-fast",
  description:
    "Free resume builder engineered for both ATS parsing and the 6-8 second recruiter scan. Region-aware photo guidance, quantified bullets, JD keyword matching, text-selectable PDF and DOCX export.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 font-sans text-slate-900">{children}</body>
    </html>
  );
}
