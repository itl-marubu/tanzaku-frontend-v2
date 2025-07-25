import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { css } from "styled-system/css";
import { Form } from "./_components/form";

export default function Home() {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
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
          className={css({
            background: "#000",
            color: "#fff",
            padding: "20px",
            borderRadius: "10px",
            width: "100%",
          })}
        >
          <h1 className={css({ fontSize: "24px", fontWeight: 700 })}>
            iTL七夕祭に、あなたの短冊を飾りましょう。
          </h1>
          <div>
            <Form />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
