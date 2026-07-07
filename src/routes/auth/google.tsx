import { sendGAEvent } from "@/lib/ga";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

type GoogleAuthSearch = {
  accessToken?: string;
  refreshToken?: string;
};

export const Route = createFileRoute("/auth/google")({
  validateSearch: (search: Record<string, unknown>): GoogleAuthSearch => ({
    accessToken:
      typeof search.accessToken === "string" ? search.accessToken : undefined,
    refreshToken:
      typeof search.refreshToken === "string" ? search.refreshToken : undefined,
  }),
  component: GoogleAuthCallback,
});

function GoogleAuthCallback() {
  const { accessToken, refreshToken } = Route.useSearch();

  useEffect(() => {
    if (!accessToken) {
      // バックエンドの Google OAuth 開始エンドポイントへ
      // （旧実装は未定義の NEXT_PUBLIC_POS_BACKEND を参照するバグがあった）
      sendGAEvent({ event: "invokeLogin", method: "google" });
      window.location.assign(
        `${import.meta.env.VITE_TANZ_BACKEND}/auth/google`,
      );
      return;
    }

    localStorage.setItem("login", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    sendGAEvent({ event: "successLogin", method: "google" });
    const timer = setTimeout(() => {
      window.location.assign("/admin");
    }, 1000);
    return () => clearTimeout(timer);
  }, [accessToken, refreshToken]);

  return <div>Loading...</div>;
}
