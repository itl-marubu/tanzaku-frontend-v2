import type { Metadata } from "next";
import { Inter, Lexend, Noto_Sans_JP, Yuji_Syuku } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import clsx from "clsx";
import localFont from "next/font/local";
import { css } from "../../styled-system/css";

const nsJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

const yujiShuku = Yuji_Syuku({
  subsets: ["latin-ext"],
  weight: ["400"],
  variable: "--font-yuji",
});

export const metadata: Metadata = {
  title: "iTL七夕祭",
  description: "iTLに短冊を飾りましょう!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Yuji+Syuku&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={clsx(
          nsJp.variable,
          lexend.variable,
          yujiShuku.variable,
          css({
            backgroundColor: "#f5f5f5",
          }),
        )}
      >
        <div
          className={css({
            fontFamily:
              "var(--font-lexend), var(--font-noto-sans-jp), sans-serif",
            fontWeight: 500,
          })}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
