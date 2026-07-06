import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

// 投稿ページ本体は後続コミットで移植する（Vite土台確認用の仮ページ）
function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-bold">tanzaku-frontend-v2 (Vite)</p>
    </main>
  );
}
