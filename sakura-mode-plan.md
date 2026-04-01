# 桜まつりモード 実装計画 (改訂版)

> 改訂日: 2026-03-30 — PR #6 の mizphses コメントを採用してアーキテクチャを変更。

---

## 実装状態

**完了。** `feature/sakura-mode` ブランチにて実装済み。

---

## アーキテクチャ（最終版）

```
NEXT_PUBLIC_FESTIVAL_MODE（環境変数）
         ↓ ビルド時に読み込み
festivalModeAtom（Jotai）
         ↓ useAtomValue()
   [全 Client Component]
```

- モードの切り替えは `.env.development` / `.env.production` の `NEXT_PUBLIC_FESTIVAL_MODE` で行う
- KV・Route Handler・ポーリングなし
- 反映はデプロイのタイミング（年数回の切り替えに対してこれで十分）

---

## 変更からの削除（mizphses 指摘対応）

| 削除したもの | 理由 |
|---|---|
| `src/app/api/mode/route.ts` | 環境変数で十分。openapi-fetch 統一方針とも合致 |
| `src/app/_components/FestivalModeProvider.tsx` | ポーリング不要になったため |
| `wrangler.jsonc` の `kv_namespaces` | KV 不使用 |
| `cloudflare-env.d.ts` の `APP_CONFIG` | 同上 |
| `client.ts` の `getFestivalMode` / `setFestivalMode` | Route Handler 削除に伴い不要 |
| 管理画面のトグル UI | 環境変数ベースのため実行時切り替え不可 |

---

## 環境変数

| 変数名 | 設定値 | ファイル |
|---|---|---|
| `NEXT_PUBLIC_FESTIVAL_MODE` | `sakura` | `.env.development` |
| `NEXT_PUBLIC_FESTIVAL_MODE` | `sakura` | `.env.production` |

有効値: `"tanabata"` / `"sakura"`（それ以外は `"tanabata"` にフォールバック）

---

## モード別 UI 仕様

| 項目 | 七夕モード | 桜まつりモード |
|---|---|---|
| 背景色 | `#000`（夜空） | `#fff0f5`（桜色） |
| 文字色 | `#fff` | `#3a1a2e` |
| イベント名 | iTL七夕祭 | iTL桜まつり |
| 投稿物 | 短冊 | 抱負 |
| フォームラベル | 短冊にかけるメッセージを教えてください。 | 新年度の抱負を教えてください。 |
| 送信ボタン | 短冊をかける | 抱負を掲げる |
| カードサイズ | 縦型 300×500px | 横型 500×300px |
| カード描画 | `public/tanzaku/0-6.webp` | Canvas 描画（グラデーション＋桜花びら） |
| 背景画像 | `public/sasa.webp` | `public/sakura-tree.webp`（未配置時は CSS 代替） |
| BGM | `/song.webm` | `/song-sakura.webm`（未配置時はコンソールエラーのみ） |
| SNS ハッシュタグ | `#iTL七夕祭2025` | `#iTL桜まつり2026` |
| コンテンツ上限 | 14文字 | 14文字（バックエンド共通） |

---

## デプロイ前の必要作業

- [ ] `public/sakura-tree.webp` の配置（任意。未配置でも CSS グラデーション代替で動作）
- [ ] `public/song-sakura.webm` の配置（任意。未配置でもエラーのみ）
