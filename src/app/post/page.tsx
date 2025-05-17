import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { css } from "styled-system/css";

export default function Home() {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      })}
    >
      <Navbar />
      <div
        className={css({
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "13px",
        })}
      >
        <div>
          <h1 className={css({ fontSize: "48px", fontWeight: 700 })}>
            短冊の送信
          </h1>
          <div>
            <p>短冊の送信は、以下のフォームからお願いします。</p>
            <p>メモ；いい感じのフォームを書く。手書きできても面白いかもね。</p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
