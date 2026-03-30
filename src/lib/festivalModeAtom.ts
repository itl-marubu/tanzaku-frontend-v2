import { atom } from "jotai";
import { DEFAULT_MODE } from "./festivalMode";
import type { FestivalMode } from "./festivalMode";

export const festivalModeAtom = atom<FestivalMode>(DEFAULT_MODE);
