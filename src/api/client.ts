import { splitTanzakuText } from "@/lib/tanzakuText";
import createClient from "openapi-fetch";
import type { components, paths } from "./generated/types";

export const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_TANZ_BACKEND,
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

type ClientTanzaku = components["schemas"]["Tanzaku"];

export type DisplayTanzaku = ClientTanzaku & {
  textLine1: string;
  textLine2: string;
};

const DEFAULT_RECENT_LIMIT = 10;
const MAX_RECENT_LIMIT = 30;

const splitContentForDisplay = (
  tanzakuList: ClientTanzaku[],
): DisplayTanzaku[] =>
  tanzakuList.map((tanzaku) => {
    const { line1, line2 } = splitTanzakuText(tanzaku.content ?? "");
    return {
      ...tanzaku,
      textLine1: line1,
      textLine2: line2,
    };
  });

export type RecentTanzakuCursor = {
  window: number;
  seed: string;
};

export const getRecentTanzaku = async (
  limit = DEFAULT_RECENT_LIMIT,
  cursor?: RecentTanzakuCursor,
) => {
  const safeLimit = Math.min(MAX_RECENT_LIMIT, Math.max(1, Math.floor(limit)));
  const response = await client.GET("/tanzaku/client", {
    params: {
      query: {
        limit: safeLimit,
        ...(cursor ? { window: cursor.window, seed: cursor.seed } : {}),
      },
    },
  });

  if (!response.data) {
    throw new Error("Failed to fetch client tanzaku");
  }

  return splitContentForDisplay(response.data);
};

// GET /config は生成型に未収録（バックエンドは並行実装中の凍結仕様）のため
// 型を手書きする。認証不要の公開エンドポイント。
export type PublicConfig = {
  festivalMode: string;
};

export const getFestivalConfig = async (): Promise<PublicConfig | null> => {
  const response = await fetch(`${import.meta.env.VITE_TANZ_BACKEND}/config`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as PublicConfig;
};
