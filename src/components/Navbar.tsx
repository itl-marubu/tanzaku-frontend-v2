"use client";

import { festivalModeAtom } from "@/lib/festivalModeAtom";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { css } from "../../styled-system/css";

export const Navbar: React.FC = () => {
  const mode = useAtomValue(festivalModeAtom);

  return (
    <div
      className={css({
        display: "flex",
        padding: "16px",
        lineHeight: "1.5",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #bbb",
      })}
    >
      <Link href="/">
        <h1
          className={clsx(
            css({
              fontSize: "24px",
              fontWeight: 700,
              fontFamily: "var(--font-metropolis), sans-serif",
            }),
          )}
        >
          {mode === "sakura" ? "抱負" : "短冊"}
        </h1>
      </Link>
      <div
        className={css({
          display: "flex",
          gap: "16px",
          alignItems: "center",
        })}
      >
        {/* <Link href="/auth">管理者ログイン</Link> */}
      </div>
    </div>
  );
};
