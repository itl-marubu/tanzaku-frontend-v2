import { DEFAULT_MODE, type FestivalMode } from "./festivalMode";

// フェスティバルモードはビルド時に確定する定数（デプロイ時に
// VITE_FESTIVAL_MODE で切り替える。実行中に変わることはない）。
const envMode = import.meta.env.VITE_FESTIVAL_MODE as FestivalMode | undefined;

export const ACTIVE_MODE: FestivalMode =
  envMode === "tanabata" || envMode === "sakura" ? envMode : DEFAULT_MODE;

export const IS_SAKURA = ACTIVE_MODE === "sakura";
