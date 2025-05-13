import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { css } from "../../styled-system/css";

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
        <div
          className={css({
            padding: "120px 0 50px 0",
          })}
        >
          <p
            className={css({
              fontWeight: 700,
              lineHeight: "1.1",
              fontSize: "58px",
              marginBottom: "25px",
              sm: {
                fontSize: "96px",
              },
              md: {
                fontSize: "125px",
              },
            })}
          >
            🏳️ 404
            <br />
            Not Found
          </p>
          <p
            className={css({
              fontWeight: 700,
              lineHeight: "2",
              fontSize: "24px",
            })}
          >
            お探しのページは見つかりませんでした。
            <br />
            システムも白旗をあげています。
          </p>
        </div>
        <div
          className={css({
            padding: "50px 0",
          })}
        >
          <p>
            お探しのページは見つけられなかったのですが、こっちにあるかもしれないです。一応ご確認いただけますと。
          </p>
          <ul
            className={css({
              listStyle: "inside circle",
              padding: 0,
              margin: 0,
              textDecoration: "underline",
            })}
          >
            <li>
              <Link href="https://www.chuo-u.ac.jp/">中央大学</Link>
            </li>
            <li>
              <Link href="https://x.com/itl_marubu">Twitter</Link>
            </li>
          </ul>
        </div>
        <Footer />
      </div>
    </div>
  );
}
