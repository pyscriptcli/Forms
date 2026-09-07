import type { Metadata } from "next";
import { Cormorant_Garamond, Bebas_Neue, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

import { PortalNav } from "@/components/PortalNav";
import { PrototypeTourModal } from "@/components/PrototypeTourModal";

export const metadata: Metadata = {
  title: "Forms Portal - PRIME Philippines",
  description: "Official Forms Portal & Request for Payment (RFP) for ClickUp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${bebas.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#f8fafc] text-[#0C0C0E]">
        <PortalNav />
        <main className="flex-1 w-full">{children}</main>
        <PrototypeTourModal />
      </body>
    </html>
  );
}
