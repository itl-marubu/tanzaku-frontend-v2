//NEXT_PUBLIC_POS_BACKEND
import { atomWithStorage } from "jotai/utils";

export const tokenAtom = atomWithStorage<string | null>("login", null);
export const refreshTokenAtom = atomWithStorage<string | null>(
  "refreshToken",
  null
);

export type User = {
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

// export const getUserInfo = async (token: string): Promise<User | null> => {
//   const client = createClient<paths>({
//     baseUrl: process.env.NEXT_PUBLIC_POS_BACKEND,
//   })
//   const response = await client
//     .GET('/auth/authed/me', {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//     .then((response) => {
//       if (response.error) {
//         throw new Error('ログインに失敗しました')
//       }
//       return response.data
//     })
//     .catch((error) => {
//       console.error(error)
//       return null
//     })
//   return response as User | null
// }

export const validateUser = async (token: string): Promise<boolean> => {
  const user = await getUserInfo(token);
  return user !== null;
};

export const isAdmin = async (token: string): Promise<boolean> => {
  const user = await getUserInfo(token);
  return user?.role === "ADMIN";
};
