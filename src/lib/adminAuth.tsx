// 管理画面のBasic認証資格情報はメモリ(React Context)にのみ保持する。
// sessionStorage/localStorage に置くとXSS時の露出範囲が広がるため
// 採用しない（リロードで再ログインになるのは許容するトレードオフ）。

import { checkSession, encodeCredentials } from "@/api/adminClient";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type AdminAuthContextValue = {
  credentials: string | null;
  login: (id: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [credentials, setCredentials] = useState<string | null>(null);

  const login = useCallback(async (id: string, password: string) => {
    const encoded = encodeCredentials(id, password);
    await checkSession(encoded);
    setCredentials(encoded);
  }, []);

  const logout = useCallback(() => {
    setCredentials(null);
  }, []);

  const value = useMemo(
    () => ({ credentials, login, logout }),
    [credentials, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
