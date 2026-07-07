// フェスティバルモードは管理画面(PUT /manage/config)から実行時に切り替え可能。
// 起動直後・GET /config 応答前は VITE_FESTIVAL_MODE をフォールバックの初期値
// として使う（不正値は console.error してデフォルトへフォールバック）。
import { getFestivalConfig } from "@/api/client";
import {
  DEFAULT_MODE,
  type FestivalMode,
  isFestivalMode,
} from "@/lib/festivalMode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// VITE_FESTIVAL_MODE の解決（従来 activeMode.ts が担っていたロジックそのもの）。
// 純粋関数として切り出し、vitest で検証する。
export function resolveEnvMode(envValue: string | undefined): FestivalMode {
  if (envValue === undefined) {
    return DEFAULT_MODE;
  }

  if (isFestivalMode(envValue)) {
    return envValue;
  }

  console.error(
    `VITE_FESTIVAL_MODE の値 "${envValue}" は不正です（"tanabata" | "sakura"）。` +
      `デフォルトの "${DEFAULT_MODE}" にフォールバックします。`,
  );
  return DEFAULT_MODE;
}

// GET /config の応答値を現在のモードへ反映するかどうかを決める純粋関数。
// 未知の値は console.error したうえで fallback（現状のモード）を維持する。
export function resolveMode(
  apiValue: string | undefined,
  fallback: FestivalMode,
): FestivalMode {
  if (apiValue === undefined) {
    return fallback;
  }

  if (isFestivalMode(apiValue)) {
    return apiValue;
  }

  console.error(
    `/config の festivalMode 値 "${apiValue}" は不正です（"tanabata" | "sakura"）。` +
      `現在のモード "${fallback}" を維持します。`,
  );
  return fallback;
}

// __root/privacy/tos の head() はコンポーネント外（モジュール評価時）に
// 実行されるため Context を参照できない。ここでは初期値のみを渡す。
export const INITIAL_FESTIVAL_MODE: FestivalMode = resolveEnvMode(
  import.meta.env.VITE_FESTIVAL_MODE,
);

type FestivalModeContextValue = {
  mode: FestivalMode;
  refresh: () => Promise<void>;
};

const FestivalModeContext = createContext<FestivalModeContextValue | null>(
  null,
);

export const FestivalModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<FestivalMode>(INITIAL_FESTIVAL_MODE);

  const refresh = useCallback(async () => {
    try {
      const config = await getFestivalConfig();
      setMode((current) => resolveMode(config?.festivalMode, current));
    } catch (error) {
      console.error("フェスティバルモードの取得に失敗しました:", error);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ mode, refresh }), [mode, refresh]);

  return (
    <FestivalModeContext.Provider value={value}>
      {children}
    </FestivalModeContext.Provider>
  );
};

export function useFestivalMode(): FestivalModeContextValue {
  const context = useContext(FestivalModeContext);
  if (!context) {
    throw new Error("useFestivalMode must be used within FestivalModeProvider");
  }
  return context;
}
