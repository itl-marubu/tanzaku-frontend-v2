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

export const getClientTanzaku = async (limit = 10) => {
  const response = await client.GET("/tanzaku/client", {
    params: {
      query: {
        limit,
      },
    },
  });
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

// 後方互換のため残す
export const getRecentTanzaku = async (limit = 10) => {
  return getClientTanzaku(limit);
};
