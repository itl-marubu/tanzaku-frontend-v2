import { atomWithStorage } from "jotai/utils";

export const tokenAtom = atomWithStorage<string | null>("login", null);
export const refreshTokenAtom = atomWithStorage<string | null>(
  "refreshToken",
  null,
);

export type User = {
  name: string;
  email: string;
  role: string;
  createdAt: string;
};
