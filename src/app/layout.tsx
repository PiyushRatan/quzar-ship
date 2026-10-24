import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { PageTransition } from "@/components/motion/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quzar Ship — Product Architecture & Specification Engine",
  description:
    "Turn product concepts and competitor URLs into production-ready system topologies, Prisma database schemas, API contracts, and 14-day sprint roadmaps.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    title: 'Quzar Ship — Product Architecture & Specification Engine',
    description:
      'Turn product concepts and competitor URLs into production-ready system topologies, Prisma database schemas, API contracts, and 14-day sprint roadmaps.',
    images: [
      {
        url: '/opengraph.png',
        width: 1200,
        height: 630,
        alt: 'Quzar Ship — Product Architecture & Specification Engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quzar Ship — Product Architecture & Specification Engine',
    description:
      'Turn product concepts and competitor URLs into production-ready system topologies, Prisma database schemas, API contracts, and 14-day sprint roadmaps.',
    images: ['/twitter-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <SmoothScrollProvider>
          <PageTransition>{children}</PageTransition>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
