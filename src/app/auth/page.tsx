import { css } from "../../../styled-system/css";
import { LoginButtons } from "./_components/LoginButtons";

export default function Home() {
  return (
    <div>
      <div>
        <h1
          className={css({
            fontSize: "2rem",
            fontWeight: "bold",
            padding: "40px 20px",
            backgroundColor: "#cfe031",
            wordBreak: "auto-phrase",
          })}
        >
          管理者 ログイン
        </h1>
        <div
          className={css({
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "20px 1rem",
            width: "100%",
          })}
        >
          <div>
            <LoginButtons />
          </div>
        </div>
      </div>
    </div>
  );
}
