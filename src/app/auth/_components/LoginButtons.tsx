"use client";

import {
  IconBrandGithubFilled,
  IconBrandGoogleFilled,
} from "@tabler/icons-react";
import { Link } from "react-aria-components";
import { css } from "styled-system/css";

export const LoginButtons: React.FC = () => {
  return (
    <div
      className={css({
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
      })}
    >
      <Link
        className={css({
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          border: "1px solid #000",
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          _hover: {
            backgroundColor: "#f0f0f0",
          },
        })}
        href="/auth/google"
      >
        <IconBrandGoogleFilled />
        Googleでログイン
      </Link>
    </div>
  );
};
