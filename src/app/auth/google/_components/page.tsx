"use client";

import { refreshTokenAtom, tokenAtom } from "@/lib/login";
import { sendGAEvent } from "@next/third-parties/google";
import { useAtom } from "jotai";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const Page = () => {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  if (!accessToken) {
    sendGAEvent({ event: "invokeLogin", method: "google" });
    const baseUrl = `${process.env.NEXT_PUBLIC_POS_BACKEND}/auth/google`;
    redirect(baseUrl);
  }
  const [_token, setToken] = useAtom(tokenAtom);
  const [_refreshToken, setRefreshToken] = useAtom(refreshTokenAtom);
  setToken(accessToken);
  setRefreshToken(refreshToken);
  useEffect(() => {
    sendGAEvent({ event: "successLogin", method: "google" });
    setTimeout(() => {
      redirect("/admin");
    }, 1000);
  }, []);
  return <div>Loading...</div>;
};
