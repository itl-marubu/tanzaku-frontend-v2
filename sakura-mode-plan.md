# 桜まつりモード 実装計画

> 仮ドキュメント。実装完了後は削除または正式なドキュメントに移行してください。

## 概要

七夕祭アプリに「桜まつりモード（新年度の抱負投稿）」を追加する。
管理画面からトグルで七夕 ↔ 桜まつりを切り替えられ、全ユーザーに即時反映される。

---

## アーキテクチャ

```
[管理画面 /admin]
     ↓ POST /api/mode
[Cloudflare KV]  ←→  GET /api/mode
                           ↓ 30秒ポーリング
                  [FestivalModeProvider]
                           ↓ Jotai atom
                    [全コンポーネント]
```

- モードの永続化: **Cloudflare KV**（キー名: `festivalMode`、バインディング名: `APP_CONFIG`）
- クライアント側: Jotai atom でリアクティブに管理
- 全ユーザーへの反映ラグ: 最大90秒（KV結果整合性60秒 + ポーリング30秒）

---

## モード別UI仕様

| 項目 | 七夕モード | 桜まつりモード |
|---|---|---|
| 背景色 | `#000`（夜空） | `#fff0f5`（桜色） |
| 文字色 | `#fff` | `#3a1a2e` |
| イベント名 | iTL七夕祭 | iTL桜まつり |
| 投稿物 | 短冊 | 抱負 |
| フォームラベル | 短冊にかけるメッセージを教えてください。 | 新年度の抱負を教えてください。 |
| 送信ボタン | 短冊をかける | 抱負を掲げる |
| カードサイズ | 縦型 300×500px | 横型 500×300px |
| カード描画 | `public/tanzaku/0-6.webp` | Canvas描画（グラデーション＋桜花びら） |
| 背景画像 | `public/sasa.webp`（笹） | `public/sakura-tree.webp`（要新規アセット） |
| SNSハッシュタグ | `#iTL七夕祭2025` | `#iTL桜まつり2026` |

---

## 新規作成ファイル

| ファイル | 役割 |
|---|---|
| `src/lib/festivalMode.ts` | `FestivalMode` 型・`MODE_CONFIG`（テキスト・カラー定義） |
| `src/lib/festivalModeAtom.ts` | Jotai atom（`festivalModeAtom`） |
| `src/app/api/mode/route.ts` | KV読み書き Route Handler（GET / POST） |
| `src/app/_components/FestivalModeProvider.tsx` | 30秒ポーリング付きモード取得 |
| `src/app/_components/Providers.tsx` | Jotai Provider + FestivalModeProvider のラッパー |
| `src/app/_components/HomeContent.tsx` | `page.tsx` の Client Component 部分 |

---

## 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `wrangler.jsonc` | `kv_namespaces` 追加（APP_CONFIG） |
| `src/api/client.ts` | `getFestivalMode` / `setFestivalMode` 追加 |
| `src/app/layout.tsx` | `<Providers>` でラップ、metadata更新 |
| `src/app/page.tsx` | `<HomeContent>` を使う形に変更 |
| `src/app/admin/page.tsx` | トグルUI実装 |
| `src/app/_components/form.tsx` | モード別テキスト（ラベル・ボタン・Toast） |
| `src/app/_components/TwitterDialog.tsx` | シェアテキスト・ハッシュタグの動的化 |
| `src/app/_components/PreviewModal.tsx` | `mode` props 追加 |
| `src/components/createTanzaku/index.tsx` | 桜モード: 横型Canvas描画 |
| `src/components/createTanzaku/index.module.scss` | 桜モード用アニメーション追加 |
| `src/components/Navbar.tsx` | モード別タイトル |
| `src/app/tree/_components/t2i.tsx` | 背景画像・カード配置座標の切り替え |
| `src/app/tree/page.module.scss` | 桜テーマのスタイル追加 |

---

## 実装ステップ

### Step 1 — Cloudflare KV セットアップ

```bash
# KV Namespace を作成
npx wrangler kv namespace create "APP_CONFIG"
# → 出力された id を wrangler.jsonc に記載

npx wrangler kv namespace create "APP_CONFIG" --preview
# → 出力された preview_id を wrangler.jsonc に記載
```

`wrangler.jsonc` に追加:
```jsonc
"kv_namespaces": [
  {
    "binding": "APP_CONFIG",
    "id": "<本番用KV ID>",
    "preview_id": "<プレビュー用KV ID>"
  }
]
```

### Step 2 — `src/lib/festivalMode.ts` 作成

型定義とテキスト・カラー設定をまとめたファイル。

```ts
export type FestivalMode = "tanabata" | "sakura";

export const FESTIVAL_MODE_KEY = "festivalMode";
export const DEFAULT_MODE: FestivalMode = "tanabata";

export const MODE_CONFIG = {
  tanabata: {
    eventName: "iTL七夕祭",
    itemName: "短冊",
    formLabel: "短冊にかけるメッセージを教えてください。",
    submitButton: "短冊をかける",
    toastMessage: "短冊が投稿されました！",
    shareText: (message: string, name: string) =>
      `#iTL七夕祭2025 に短冊を投稿しました！\n...\n「${message}」\nお名前：${name}`,
  },
  sakura: {
    eventName: "iTL桜まつり",
    itemName: "抱負",
    formLabel: "新年度の抱負を教えてください。",
    submitButton: "抱負を掲げる",
    toastMessage: "抱負が投稿されました！",
    shareText: (message: string, name: string) =>
      `#iTL桜まつり2026 に抱負を投稿しました！\n...\n「${message}」\nお名前：${name}`,
  },
} as const;
```

### Step 3 — `src/app/api/mode/route.ts` 作成

```ts
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { DEFAULT_MODE, FESTIVAL_MODE_KEY, type FestivalMode } from "@/lib/festivalMode";

export async function GET() {
  const { env } = await getCloudflareContext();
  const mode = await env.APP_CONFIG.get(FESTIVAL_MODE_KEY);
  return NextResponse.json({ mode: (mode as FestivalMode) ?? DEFAULT_MODE });
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const { mode } = await request.json();
  if (mode !== "tanabata" && mode !== "sakura") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  await env.APP_CONFIG.put(FESTIVAL_MODE_KEY, mode);
  return NextResponse.json({ mode });
}
```

### Step 4 — Jotai atom + Provider 作成

`src/lib/festivalModeAtom.ts`:
```ts
import { atom } from "jotai";
import type { FestivalMode } from "./festivalMode";
import { DEFAULT_MODE } from "./festivalMode";

export const festivalModeAtom = atom<FestivalMode>(DEFAULT_MODE);
```

`src/app/_components/FestivalModeProvider.tsx`:
- 初回マウント時に `/api/mode` から取得
- 30秒ごとにポーリング

`src/app/_components/Providers.tsx`:
- Jotai `<Provider>` + `<FestivalModeProvider>` をまとめてラップ

### Step 5 — `layout.tsx` に `<Providers>` を追加

`<body>` 内の `<div>` を `<Providers>` で包む。
`metadata` の `title` / `description` も動的化（または桜まつり対応に更新）。

### Step 6 — 管理画面（`src/app/admin/page.tsx`）実装

- 現在のモードをAPIから取得して表示
- トグルボタンで七夕 ↔ 桜まつりを切り替え
- 切り替え後に成功メッセージをフラッシュ表示

### Step 7 — ホーム・フォームのテキスト対応

- `src/app/page.tsx` → `<HomeContent>` に切り出し
- `src/app/_components/form.tsx` → `useAtomValue(festivalModeAtom)` + `MODE_CONFIG` でテキスト動的化

### Step 8 — Canvas描画の桜モード対応

`src/components/createTanzaku/index.tsx` に `mode` prop を追加。

桜モードの描画:
- サイズ: 500×300px（横型）
- 背景: グラデーション（`#fff0f5` → `#ffd6e7`）
- 装飾: 桜の花びらを `arc` で描画
- テキスト: 横書き・中央配置

### Step 9 — ツリーページの桜対応

`src/app/tree/_components/t2i.tsx`:
- 背景画像を `mode` に応じて切り替え（`sasa.webp` / `sakura-tree.webp`）
- カード配置座標を桜の木の形に合わせた配列に切り替え

`src/app/tree/page.module.scss`:
- 桜モード用の背景色・テキスト色を追加

### Step 10 — 細部対応

- `TwitterDialog.tsx`: `MODE_CONFIG[mode].shareText` を使用
- `PreviewModal.tsx`: `mode` props を `CreateTanzaku` に渡す
- `Navbar.tsx`: `use client` 化してモード別タイトル表示

---

## 画像アセットについて

桜モードに必要な画像（別途用意が必要）:

| ファイル | 用途 | 代替 |
|---|---|---|
| `public/sakura-tree.webp` | ツリーページの背景（桜の木） | CSSで代替可（背景色のみ） |
| `public/sakura-card/0-6.webp` | 抱負カード画像（7種） | Canvas描画で代替（Step 8） |

カード画像は Canvas 描画で実装するため、`sakura-card/` は不要。
`sakura-tree.webp` のみ用意すれば最低限の見た目が成立する。

---

## 方針まとめ

- バックエンドAPIの変更は**なし**（短冊・抱負は同一テーブルを使い回す）
- 既存の七夕モードの動作は一切変えない
- 画像アセットなしでもCanvas描画で桜モードは動作する
- 認証なしで管理画面からトグル可能（必要なら後から認証追加）
