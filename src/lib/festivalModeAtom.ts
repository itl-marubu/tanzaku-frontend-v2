import { atom } from "jotai";
import { DEFAULT_MODE } from "./festivalMode";
import type { FestivalMode } from "./festivalMode";

const envMode = process.env.NEXT_PUBLIC_FESTIVAL_MODE as
  | FestivalMode
  | undefined;
const initialMode: FestivalMode =
  envMode === "tanabata" || envMode === "sakura" ? envMode : DEFAULT_MODE;

export const festivalModeAtom = atom<FestivalMode>(initialMode);
