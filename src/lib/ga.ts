// Google Analytics (gtag) の薄いラッパー。gtag スニペットは index.html で
// 読み込む。旧実装の @next/third-parties/google sendGAEvent と同じ
// 呼び出し方（可変長引数 or イベントオブジェクト）を受け付ける。

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function sendGAEvent(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer ??= [];
  // 旧実装と同様、オブジェクト1つの形式は dataLayer に直接 push する
  if (args.length === 1 && typeof args[0] === "object") {
    window.dataLayer.push(args[0]);
    return;
  }
  window.gtag?.(...args);
}

// SPA ではルーター遷移時に page_view を明示的に送る
// （旧 Next.js 実装では自動送信されていた）
export function sendPageView(path: string) {
  sendGAEvent("event", "page_view", { page_path: path });
}
