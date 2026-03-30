# 桜まつりモード 実装ログ

> 実施日: 2026-03-30

---

## 実施内容

`sakura-mode-plan.md` に基づき、七夕 ↔ 桜まつりのモード切り替え機能を実装。
バックエンド（`/home/yum/tanzakuv2/`）への変更なし。

---

## 確認済み事項

- バックエンドのコンテンツ上限は **14文字**（server-side強制）。桜モードでも同じ上限を使用する方針で合意済み。
- `/api/mode` POSTエンドポイントは認証なし（意図的）。
- KV IDは未設定（デプロイ前に要設定 → 後述）。

---

## 新規作成ファイル

| ファイル | 役割 |
|---|---|
| `src/lib/festivalMode.ts` | `FestivalMode` 型・`MODE_CONFIG`（テキスト・カラー・シェアテキスト定義） |
| `src/lib/festivalModeAtom.ts` | Jotai atom（`festivalModeAtom`）、デフォルト `"tanabata"` |
| `src/app/api/mode/route.ts` | Cloudflare KV 読み書き Route Handler（GET / POST） |
| `src/app/_components/FestivalModeProvider.tsx` | 初回 + 30秒ポーリングでモード取得、atomに書き込み |
| `src/app/_components/Providers.tsx` | Jotai `<Provider>` + `<FestivalModeProvider>` のラッパー |
| `src/app/_components/HomeContent.tsx` | ホームページの Client Component（モード別背景色・見出しテキスト） |

---

## 変更ファイル

### 設定系

| ファイル | 変更内容 |
|---|---|
| `wrangler.jsonc` | `kv_namespaces` 追加（`APP_CONFIG` バインディング）。**IDは未設定（プレースホルダー）** |
| `cloudflare-env.d.ts` | `APP_CONFIG: KVNamespace` を `Cloudflare.Env` に追加 |
| `src/api/client.ts` | `getFestivalMode()` / `setFestivalMode()` 追加（`/api/mode` を fetch） |

### アプリ層

| ファイル | 変更内容 |
|---|---|
| `src/app/layout.tsx` | `<Providers>` でラップ。`Inter` / `localFont` の未使用importを削除 |
| `src/app/page.tsx` | `<HomeContent />` に差し替え（元の静的JSXを削除） |
| `src/app/admin/page.tsx` | モードトグルUI実装（現在のモード表示 + 切り替えボタン + フラッシュメッセージ） |

### コンポーネント層

| ファイル | 変更内容 |
|---|---|
| `src/app/_components/form.tsx` | `useAtomValue(festivalModeAtom)` + `MODE_CONFIG` でラベル・ボタン・Toastを動的化。`mode` を下流へ伝播 |
| `src/app/_components/TwitterDialog.tsx` | `mode` prop追加。シェアテキスト・ファイル名・画像表示サイズをモード別に変更 |
| `src/app/_components/PreviewModal.tsx` | `mode` prop追加。`CreateTanzaku` に渡す |
| `src/components/createTanzaku/index.tsx` | `mode?: FestivalMode` prop追加。桜モード: 500×300横型Canvas描画（グラデーション + 花びら装飾 + 横書きテキスト） |
| `src/components/createTanzaku/index.module.scss` | `sakuraFloat` アニメーション追加（ふわふわ浮遊） |
| `src/components/Navbar.tsx` | `"use client"` 化。モード別タイトル（「短冊」/「抱負」） |
| `src/app/tree/_components/t2i.tsx` | モード別背景画像（`sasa.webp` / `sakura-tree.webp`）・配置座標配列切り替え。`sakura-tree.webp` 未配置時はCSSグラデーションで代替 |
| `src/app/tree/page.tsx` | `useAtomValue(festivalModeAtom)` で `.sakura` クラスを条件付与 |
| `src/app/tree/page.module.scss` | `.sakura` クラス追加（`background-color: #fff0f5; color: #3a1a2e`） |

### 型定義

| ファイル | 変更内容 |
|---|---|
| `src/components/createTanzaku/index.module.scss.d.ts` | `sakuraFloat` 追加 |
| `src/app/tree/page.module.scss.d.ts` | `sakura` 追加 |

### ローカル開発対応

| ファイル | 変更内容 |
|---|---|
| `src/app/api/mode/route.ts` | `getCloudflareContext` が使えない環境（`pnpm dev`）向けに try-catch フォールバック追加。モードはメモリ内変数で保持（サーバー再起動でリセット） |

### BGM切り替え

| ファイル | 変更内容 |
|---|---|
| `src/app/tree/_components/meta.tsx` | `useAtomValue(festivalModeAtom)` でモード取得。`songUrl` をモード別に切り替え（`/song.webm` / `/song-sakura.webm`）。モード変化時に再生中の音楽を即時差し替え |

---

## デプロイ前に必要な作業

### 1. Cloudflare KV Namespace の作成

```bash
npx wrangler kv namespace create "APP_CONFIG"
# → 出力された id を wrangler.jsonc の "id" に記載

npx wrangler kv namespace create "APP_CONFIG" --preview
# → 出力された id を wrangler.jsonc の "preview_id" に記載
```

`wrangler.jsonc` の該当箇所：
```jsonc
"kv_namespaces": [
  {
    "binding": "APP_CONFIG",
    "id": "YOUR_KV_ID_HERE",        // ← ここ
    "preview_id": "YOUR_PREVIEW_KV_ID_HERE"  // ← ここ
  }
]
```

### 2. `public/sakura-tree.webp` の配置（任意）

未配置でも `t2i.tsx` がCSSグラデーション背景で代替するため動作する。
配置すれば桜の木が背景に表示される。

### 3. `public/song-sakura.webm` の配置

桜まつりモード用の音源ファイル。未配置でもエラーはコンソールに出るだけで他の動作には影響なし。

---

## アーキテクチャ（実装後）

```
[管理画面 /admin]
     ↓ setFestivalMode() → POST /api/mode
[Cloudflare KV: APP_CONFIG.festivalMode]
     ↑ GET /api/mode ← FestivalModeProvider（30秒ポーリング）
                               ↓ setMode(atom)
                      [festivalModeAtom（Jotai）]
                               ↓ useAtomValue()
                    [全Client Component]
```

反映ラグ: 最大90秒（KV結果整合性60秒 + ポーリング30秒）

---

## 技術メモ

- `getCloudflareContext({ async: true })` — OpenNext v1 beta では `async: true` オプションが必要
- SCSS `.d.ts` は自動生成だが今回は手動で追記（ジェネレーター未設定）
- `request.json()` は TypeScript strict mode で `unknown` 返却 → `as { mode: unknown }` でキャスト
