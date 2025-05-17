import Link from "next/link";
import { css } from "../../styled-system/css";

export const Footer: React.FC = () => {
  return (
    <div
      className={css({
        padding: "30px 0",
        display: "flex",
        flexDirection: "column",
        marginX: "20px",
        alignItems: "center",
        md: {
          flexDirection: "row",
          justifyContent: "space-between",
        },
      })}
    >
      <p>©2025 iTL Marubu</p>
      <span
        className={css({
          display: "flex",
          fontSize: "14px",
          gap: "10px",
          fontWeight: 400,
        })}
      >
        <Link href="/privacy">個人情報保護方針</Link>
        <Link href="/tos">ご利用規約</Link>
      </span>
    </div>
  );
};
