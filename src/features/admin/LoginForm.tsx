import { AdminApiError } from "@/api/adminClient";
import { useAdminAuth } from "@/lib/adminAuth";
import { useState } from "react";

export const LoginForm: React.FC = () => {
  const { login } = useAdminAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(id, password);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        setError("IDまたはパスワードが正しくありません");
      } else {
        console.error(err);
        setError("ログインに失敗しました。時間をおいて再度お試しください");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
      <form
        onSubmit={handleSubmit}
        className="w-[90%] max-w-[400px] rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="mb-6 text-xl font-bold text-[#2c3e50]">
          短冊管理画面 ログイン
        </h1>
        {error && (
          <div className="mb-4 rounded bg-[#f8d7da] p-3 text-sm text-[#721c24]">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label
            htmlFor="admin-id"
            className="mb-2 block font-semibold text-[#2c3e50]"
          >
            管理者ID
          </label>
          <input
            id="admin-id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
            required
            className="w-full rounded border border-[#bdc3c7] p-2 focus:border-[#3498db] focus:outline-none"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="admin-password"
            className="mb-2 block font-semibold text-[#2c3e50]"
          >
            パスワード
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded border border-[#bdc3c7] p-2 focus:border-[#3498db] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded bg-[#3498db] px-4 py-2 font-semibold text-white ${
            isSubmitting
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:opacity-80"
          }`}
        >
          {isSubmitting ? "確認中..." : "ログイン"}
        </button>
        <p className="mt-4 text-xs text-[#7f8c8d]">
          資格情報はこの画面を開いている間だけ保持されます。リロードすると再ログインが必要です。
        </p>
      </form>
    </div>
  );
};
