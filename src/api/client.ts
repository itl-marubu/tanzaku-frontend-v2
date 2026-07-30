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
  signal?: AbortSignal,
) => {
  const safeLimit = Math.min(MAX_RECENT_LIMIT, Math.max(1, Math.floor(limit)));
  const response = await client.GET("/tanzaku/client", {
    params: {
      query: {
        limit: safeLimit,
        ...(cursor ? { window: cursor.window, seed: cursor.seed } : {}),
      },
    },
    signal,
  });

  if (!response.data) {
    throw new Error("Failed to fetch client tanzaku");
  }

  return splitContentForDisplay(response.data);
};

// 認証不要の公開エンドポイント。GET /config は OpenAPI v2.0.0 で生成型にも
// 収録済みだが、ここでは「取得に失敗したら null を返して現在のモードを維持する」
// 取り回しのため素の fetch + 手書き型のままにしている。生成型へ寄せる場合は
// client.GET("/config") の response.data を見る形へ置き換えられる。
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
