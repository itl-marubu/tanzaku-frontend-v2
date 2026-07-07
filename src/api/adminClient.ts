// 管理API (/manage/*) クライアント。Basic認証ヘッダーを毎リクエスト
// 手動付与する（CORS origin:"*" のため credentials は omit のまま）。
// 型はバックエンドの凍結仕様に基づく手書き定義。

const baseUrl = import.meta.env.VITE_TANZ_BACKEND;

export type ManageEventRef = {
  id: string;
  name: string;
};

export type ManageTanzaku = {
  id: string;
  content: string;
  userName: string;
  visiblePattern: boolean;
  validationResult: number;
  logicalDelete: boolean;
  createdAt: string;
  eventId: string | null;
  event: ManageEventRef | null;
};

export type ManageEvent = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { tanzakus: number };
};

export type TanzakuOperation =
  | { id: string; operation: "delete" }
  | { id: string; operation: "hardDelete" }
  | {
      id: string;
      operation: "update";
      content?: string;
      userName?: string;
      validationResult?: number;
      eventId?: string | null;
    };

export type CreateTanzakuInput = {
  content: string;
  userName: string;
  validationResult?: number;
  eventId?: string | null;
};

export class AdminApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

export function encodeCredentials(id: string, password: string): string {
  return btoa(`${id}:${password}`);
}

async function request<T>(
  credentials: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: "omit",
    headers: {
      Authorization: `Basic ${credentials}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new AdminApiError(
      response.status,
      `Request failed: ${init.method ?? "GET"} ${path} (${response.status})`,
    );
  }

  return (await response.json()) as T;
}

// 資格情報の疎通確認。/manage/session が未デプロイの旧バックエンドでは
// 404 になるため、その場合のみ /manage/tanzakus で代替確認する。
export async function checkSession(credentials: string): Promise<boolean> {
  try {
    await request<{ ok: boolean }>(credentials, "/manage/session");
    return true;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) {
      await request<ManageTanzaku[]>(credentials, "/manage/tanzakus");
      return true;
    }
    throw error;
  }
}

export function getTanzakus(credentials: string): Promise<ManageTanzaku[]> {
  return request(credentials, "/manage/tanzakus");
}

export function editTanzakus(
  credentials: string,
  operations: TanzakuOperation[],
): Promise<{ success: boolean }> {
  return request(credentials, "/manage/tanzakus", {
    method: "POST",
    body: JSON.stringify(operations),
  });
}

export function createManageTanzaku(
  credentials: string,
  input: CreateTanzakuInput,
): Promise<{ success: boolean; id: string }> {
  return request(credentials, "/manage/tanzakus/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getEvents(credentials: string): Promise<ManageEvent[]> {
  return request(credentials, "/manage/events");
}

export function createEvent(
  credentials: string,
  input: { name: string; description?: string },
): Promise<{ success: boolean; id: string }> {
  return request(credentials, "/manage/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function activateEvent(
  credentials: string,
  id: string,
): Promise<{ success: boolean }> {
  return request(credentials, `/manage/events/${id}/activate`, {
    method: "POST",
  });
}

export function deactivateAllEvents(
  credentials: string,
): Promise<{ success: boolean }> {
  return request(credentials, "/manage/events/deactivate-all", {
    method: "POST",
  });
}

export type ManageConfig = {
  festivalMode: string;
};

export function updateFestivalMode(
  credentials: string,
  festivalMode: string,
): Promise<{ success: boolean }> {
  return request(credentials, "/manage/config", {
    method: "PUT",
    body: JSON.stringify({ festivalMode } satisfies ManageConfig),
  });
}
