import type { Metadata } from "next";
import { Inter, Lexend, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
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
      <body
        className={clsx(
          nsJp.variable,
          lexend.variable,
          css({
            backgroundColor: "#f5f5f5",
          })
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
