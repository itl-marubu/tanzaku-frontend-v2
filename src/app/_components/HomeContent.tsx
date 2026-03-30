"use client";

import { Footer } from "@/components/Footer";
import { festivalModeAtom } from "@/lib/festivalModeAtom";
import { useAtomValue } from "jotai";
import { css } from "styled-system/css";
import { Form } from "./form";

export const HomeContent: React.FC = () => {
  const mode = useAtomValue(festivalModeAtom);
  const isSakura = mode === "sakura";

  return (
    <div
      style={{ background: isSakura ? "#fff0f5" : "#000" }}
      className={css({
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      })}
    >
      <div
        className={css({
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "13px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
        })}
      >
        <div
          style={{ color: isSakura ? "#3a1a2e" : "#fff" }}
          className={css({
            padding: "20px",
            borderRadius: "10px",
            width: "100%",
          })}
        >
          <h1 className={css({ fontSize: "24px", fontWeight: 700 })}>
            {isSakura
              ? "iTL桜まつりに、あなたの抱負を掲げましょう。"
              : "iTL七夕祭に、あなたの短冊を飾りましょう。"}
          </h1>
          <div>
            <Form />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
