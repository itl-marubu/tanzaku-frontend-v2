import createClient from "openapi-fetch";
import type { components, paths } from "./generated/types";

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

type ClientTanzaku = components["schemas"]["Tanzaku"];

const DEFAULT_RECENT_LIMIT = 10;
const MAX_RECENT_LIMIT = 30;

const splitContentForDisplay = (tanzakuList: ClientTanzaku[]) =>
  tanzakuList.map((tanzaku) => {
    const textLine1 = tanzaku.content?.slice(0, 7);
    const textLine2 = tanzaku.content?.slice(7);
    return {
      ...tanzaku,
      textLine1,
      textLine2,
    };
  });

export const getRecentTanzaku = async (limit = DEFAULT_RECENT_LIMIT) => {
  const safeLimit = Math.min(MAX_RECENT_LIMIT, Math.max(1, Math.floor(limit)));
  const response = await client.GET("/tanzaku/client", {
    params: {
      query: {
        limit: safeLimit,
      },
    },
  });

  if (!response.data) {
    throw new Error("Failed to fetch client tanzaku");
  }

  return splitContentForDisplay(response.data);
};
