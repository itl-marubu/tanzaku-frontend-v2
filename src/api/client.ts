import createClient from "openapi-fetch";
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

type TanzakuWithMeta = {
  content?: string;
  createdAt?: string;
  visiblePattern?: boolean;
  logicalDelete?: boolean;
} & Record<string, unknown>;

const DEFAULT_RECENT_LIMIT = 10;
const LEGACY_CLIENT_LIMIT = 10;

const splitContentForDisplay = (tanzakuList: TanzakuWithMeta[]) =>
  tanzakuList.map((tanzaku) => {
    const textLine1 = tanzaku.content?.slice(0, 7);
    const textLine2 = tanzaku.content?.slice(7);
    return {
      ...tanzaku,
      textLine1,
      textLine2,
    };
  });

const createdAtToUnix = (createdAt: unknown) => {
  if (typeof createdAt !== "string") return 0;
  const timestamp = Date.parse(createdAt);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getRecentFromAllTanzaku = async (limit: number) => {
  const allResponse = await client.GET("/tanzaku");
  const allTanzaku = (allResponse.data ?? []) as TanzakuWithMeta[];
  const recentTanzaku = allTanzaku
    .filter(
      (tanzaku) =>
        tanzaku.logicalDelete !== true && tanzaku.visiblePattern !== false
    )
    .sort((a, b) => createdAtToUnix(b.createdAt) - createdAtToUnix(a.createdAt))
    .slice(0, limit);

  return splitContentForDisplay(recentTanzaku);
};

export const getRecentTanzaku = async (limit = DEFAULT_RECENT_LIMIT) => {
  const safeLimit = Math.max(1, Math.floor(limit));
  const backendUrl = process.env.NEXT_PUBLIC_TANZ_BACKEND;

  // BEがlimitクエリを受け付ける環境ではこちらを優先
  if (backendUrl) {
    try {
      const url = new URL("/tanzaku/client", backendUrl);
      url.searchParams.set("limit", String(safeLimit));

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = (await response.json()) as TanzakuWithMeta[];
        if (Array.isArray(data)) {
          const clientRecent = splitContentForDisplay(data.slice(0, safeLimit));

          // 一時フォールバック:
          // limit未反映BEは /client が10件固定で返るため、要求件数に満たない場合のみ /tanzaku を試す
          if (safeLimit > LEGACY_CLIENT_LIMIT && data.length < safeLimit) {
            const fallbackRecent = await getRecentFromAllTanzaku(safeLimit);
            return fallbackRecent.length > clientRecent.length
              ? fallbackRecent
              : clientRecent;
          }

          return clientRecent;
        }
      }
    } catch {
      // フォールバックで通常一覧APIから件数を調整する
    }
  }

  // BE未対応時のフォールバック: 全件から表示対象を絞る
  return getRecentFromAllTanzaku(safeLimit);
};
