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
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Forms Portal",
  description: "Official Forms Portal & Request Tracker for ClickUp",
  openGraph: {
    title: "Forms Portal",
    description: "Official Forms Portal & Request Tracker for ClickUp",
    siteName: "Forms Portal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forms Portal",
    description: "Official Forms Portal & Request Tracker for ClickUp",
  },
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
        <AuthProvider>
          <PortalNav />
          <main className="flex-1 w-full">{children}</main>
          <PrototypeTourModal />
        </AuthProvider>
      </body>
    </html>
  );
}
