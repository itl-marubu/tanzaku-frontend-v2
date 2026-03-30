import createClient from "openapi-fetch";
import type { FestivalMode } from "@/lib/festivalMode";
import type { paths } from "./generated/types";

export const client = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_TANZ_BACKEND,
});

export const getTanzakuList = async () => {
  const response = await client.GET("/tanzaku");
  return response.data;
};

export const createTanzaku = async (data: {
  content: string;
  userName: string;
}) => {
  const response = await client.POST("/tanzaku", {
    body: data,
  });
  return response.data;
};

export const getFestivalMode = async (): Promise<FestivalMode> => {
  const res = await fetch("/api/mode");
  const data = (await res.json()) as { mode: FestivalMode };
  return data.mode;
};

export const setFestivalMode = async (mode: FestivalMode): Promise<void> => {
  await fetch("/api/mode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
};

export const getRecentTanzaku = async () => {
  const response = await client.GET("/tanzaku/client");
  // foreachで7文字目でtextline1, textline2に分割
  const tanzakuArray = response.data?.map((tanzaku) => {
    const textLine1 = tanzaku.content?.slice(0, 7);
    const textLine2 = tanzaku.content?.slice(7);
    return {
      ...tanzaku,
      textLine1,
      textLine2,
    };
  });
  return tanzakuArray;
};
