import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "coy.",
  description: "Find out if your crush likes you back",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="mx-auto w-full max-w-[480px] min-h-dvh flex flex-col relative bg-bg">
          {children}
        </div>
      </body>
    </html>
  );
}
