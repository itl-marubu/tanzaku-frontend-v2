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

---

## アーキテクチャ変更 (2026-03-30 / PR #6 レビュー対応)

PR #6 の mizphses コメントを受け、KV ベースの実装を環境変数ベースに変更。

### 変更理由

- モードの切り替え頻度は年数回程度であり、KV + ポーリングは過剰
- `/api/mode` Route Handler は openapi-fetch による型管理の方針と合わない
- 環境変数で十分シンプルかつ安全（認証問題も解消）

### 変更内容

| ファイル | 変更 |
|---|---|
| `src/lib/festivalMode.ts` | `FESTIVAL_MODE_KEY` 定数を削除 |
| `src/lib/festivalModeAtom.ts` | `NEXT_PUBLIC_FESTIVAL_MODE` 環境変数から初期値を取得するよう変更 |
| `src/app/_components/Providers.tsx` | `FestivalModeProvider` の参照を削除 |
| `src/app/_components/FestivalModeProvider.tsx` | **削除** |
| `src/app/api/mode/route.ts` | **削除**（`/api/mode` ディレクトリごと） |
| `src/api/client.ts` | `getFestivalMode` / `setFestivalMode` を削除 |
| `src/app/admin/page.tsx` | トグル UI を削除し、env var ベースの現在モード表示のみに変更 |
| `wrangler.jsonc` | `kv_namespaces` ブロックを削除 |
| `cloudflare-env.d.ts` | `APP_CONFIG: KVNamespace` を削除 |
| `.env.development` | `NEXT_PUBLIC_FESTIVAL_MODE=tanabata` を追加 |
| `.env.production` | `NEXT_PUBLIC_FESTIVAL_MODE=sakura` を追加（fallback 値） |
| `.github/workflows/deploy.yaml` | `workflow_dispatch` にモード選択入力を追加、ビルド時に env として渡す |

### モード切替の操作手順（本番）

`NEXT_PUBLIC_*` 変数は**ビルド時に焼き込まれる**ため、Cloudflare の runtime 環境変数では制御できない。
デプロイワークフローに `workflow_dispatch` 入力を追加し、GitHub Actions UI から選択できるようにした。

**手順:**
1. GitHub リポジトリ → Actions → **Deploy** ワークフローを開く
2. "Run workflow" ボタンをクリック
3. `フェスティバルモード` のドロップダウンで `tanabata` または `sakura` を選択
4. "Run workflow" を実行 → ビルド＆デプロイが走り、選択したモードで本番が更新される

**仕組み:**
```
GitHub Actions UI (入力: festival_mode)
        ↓
pnpm run build-opennextjs  ← NEXT_PUBLIC_FESTIVAL_MODE=${{ inputs.festival_mode }}
        ↓ ビルド時に変数が焼き込まれる
Cloudflare Workers にデプロイ
```

`.env.production` の値（`sakura`）は入力が省略された場合の fallback としてのみ機能する。

---

## 追加実装・調査ログ (2026-03-31)

### 運用・設定の更新

- `sakura` 開発を前提に、`.env.development` を `NEXT_PUBLIC_FESTIVAL_MODE=sakura` に変更。
- GitHub Actions の Deploy ワークフローで `festival_mode` のデフォルト値を `sakura` に変更。
- `sakura-mode-plan.md` の環境変数表記を実態に合わせて更新。
- `.serena/memories/project_overview.md` を最新アーキテクチャ（`/api/mode` 廃止、env 切替）に合わせて更新。

### コード健全化（現状把握で見つかった問題の修正）

- `src/app/tree/page.tsx` の `styles.static` 参照を廃止し、桜モード時の揺れ停止をインライン style で適用。
- `src/app/tree/page.module.scss` の不正値（`display: absolute`, `width: fixed`）を修正。
- `src/components/createTanzaku/index.tsx` の lint 指摘（単一宣言）を修正。
- 上記修正後、`pnpm -s typecheck` / `pnpm -s lint` が通過することを確認。

### 桜カードの見た目変更（tree）

- ユーザー要望により、桜カードを「花弁型」から「四角 + グラデーション（PR #6 の 524b5d3 相当）」へ戻した。
- これに合わせて `CreateTanzaku` の桜キャンバスを `500x300` に戻し、描画処理を旧実装系に復元。
- `src/app/tree/_components/t2i.tsx` の配置計算比率を `500:300` 前提に補正。
- 後続要望により、桜カードの `sakuraFloat` アニメーションは停止（クラス適用を外す）。

### 花びらパーティクル追加

- `src/app/tree/_components/SakuraPetalParticles.tsx` を新規作成。
- `public/hanabira.svg` を使った全画面 Canvas パーティクルを実装し、`mode === "sakura"` のときのみ表示。
- 粒子数、ランダムサイズ・回転・透明度、右下方向への落下を実装。
- `pointer-events: none` で既存 UI 操作を阻害しないように調整。
- `prefers-reduced-motion: reduce` 時はアニメーションを抑止。

### 背景描画の不具合調査（Playwright）

- ユーザー報告「投稿はあるのに桜背景が描画されない」を Playwright で再現・調査。
- 調査で確認した事象:
  - `/sakura-tree.webp` は `200` で取得される。
  - 背景 canvas のピクセル値が透明（`[0,0,0,0]`）になるケースがある。
  - `public/sakura-tree.webp` と `public/sasa.webp` は同一ハッシュ（同じ画像データ）。
- 対応:
  - `Image` の `onload/onerror` を `src` 設定前に登録し、`complete` チェックでイベント取りこぼしを吸収。
  - `sakura` 時の `return null` を廃止し、背景 canvas は常に描画してカード配置だけ条件分岐。
  - 背景 canvas を左下固定（`left: 0; bottom: 0; display: block;`）にして下端の空白を抑制。

### 既知事項（現時点）

- `song-sakura.webm` は未配置のため、`/tree` で 404 ログが出る（他機能には大きな影響なし）。
- `sakura-tree.webp` が `sasa.webp` と同一のため、桜専用背景を期待する場合は画像差し替えが必要。
