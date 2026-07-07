import { DEFAULT_MODE, type FestivalMode } from "./festivalMode";

// フェスティバルモードはビルド時に確定する定数（デプロイ時に
// VITE_FESTIVAL_MODE で切り替える。実行中に変わることはない）。
const envMode = import.meta.env.VITE_FESTIVAL_MODE as FestivalMode | undefined;

const isValidMode = envMode === "tanabata" || envMode === "sakura";

if (envMode !== undefined && !isValidMode) {
  console.error(
    `VITE_FESTIVAL_MODE の値 "${envMode}" は不正です（"tanabata" | "sakura"）。` +
      `デフォルトの "${DEFAULT_MODE}" にフォールバックします。`,
  );
}

export const ACTIVE_MODE: FestivalMode = isValidMode ? envMode : DEFAULT_MODE;

export const IS_SAKURA = ACTIVE_MODE === "sakura";
