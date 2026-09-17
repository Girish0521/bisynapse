import type { Metadata } from "next";
import { Montserrat, Noto_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BISynapse — Digital Gateway to BIS Standards, Certification & Compliance",
  description: "Independent SIH prototype for Indian Standards and BIS service guidance. Not an official government portal.",
};

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], display: "swap" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${notoSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-[#0F4C81] selection:text-white">
        <div role="note" className="prototype-notice">
          Independent SIH prototype, not an official BIS or Government of India portal. Example data and planned features do not establish product verification or regulatory compliance.
        </div>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
