"use client";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { getFestivalMode, setFestivalMode } from "@/api/client";
import type { FestivalMode } from "@/lib/festivalMode";
import { useEffect, useState } from "react";
import { css } from "../../../styled-system/css";

export default function AdminPage() {
  const [mode, setMode] = useState<FestivalMode>("tanabata");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    getFestivalMode().then((m) => {
      setMode(m);
      setIsLoading(false);
    });
  }, []);

  const handleToggle = async () => {
    const newMode: FestivalMode = mode === "tanabata" ? "sakura" : "tanabata";
    setIsSaving(true);
    await setFestivalMode(newMode);
    setMode(newMode);
    setIsSaving(false);
    setFlashMessage(
      `モードを「${newMode === "tanabata" ? "七夕モード" : "桜まつりモード"}」に切り替えました。`,
    );
    setTimeout(() => setFlashMessage(null), 3000);
  };

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

        {isLoading ? (
          <p>読み込み中...</p>
        ) : (
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

            <button
              type="button"
              onClick={handleToggle}
              disabled={isSaving}
              className={css({
                padding: "12px 24px",
                background: mode === "tanabata" ? "#ffb7c5" : "#000",
                color: mode === "tanabata" ? "#3a1a2e" : "#fff",
                borderRadius: "6px",
                border: "none",
                cursor: isSaving ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: "16px",
                opacity: isSaving ? 0.6 : 1,
                alignSelf: "flex-start",
              })}
            >
              {isSaving
                ? "切り替え中..."
                : mode === "tanabata"
                  ? "🌸 桜まつりモードに切り替え"
                  : "🎋 七夕モードに切り替え"}
            </button>

            {flashMessage && (
              <p
                className={css({
                  padding: "8px 12px",
                  background: "#f0fff4",
                  border: "1px solid #86efac",
                  borderRadius: "4px",
                  color: "#166534",
                  fontSize: "14px",
                })}
              >
                {flashMessage}
              </p>
            )}

            <p className={css({ fontSize: "12px", color: "#999", marginTop: "8px" })}>
              切り替えは最大90秒で全ユーザーに反映されます。
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
