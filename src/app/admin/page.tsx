"use client";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useAtomValue } from "jotai";
import { festivalModeAtom } from "@/lib/festivalModeAtom";
import { css } from "../../../styled-system/css";

export default function AdminPage() {
  const mode = useAtomValue(festivalModeAtom);

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      })}
    >
      <Navbar />
      <div
        className={css({
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "40px 16px",
        })}
      >
        <h1 className={css({ fontSize: "32px", fontWeight: 700, marginBottom: "32px" })}>
          フェスティバル管理
        </h1>

        <div
          className={css({
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          })}
        >
          <div>
            <p className={css({ fontSize: "14px", color: "#666", marginBottom: "4px" })}>
              現在のモード
            </p>
            <p className={css({ fontSize: "24px", fontWeight: 700 })}>
              {mode === "tanabata" ? "🎋 七夕モード" : "🌸 桜まつりモード"}
            </p>
          </div>

          <p className={css({ fontSize: "12px", color: "#999" })}>
            モードの切り替えは <code>NEXT_PUBLIC_FESTIVAL_MODE</code> 環境変数で行います。
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
