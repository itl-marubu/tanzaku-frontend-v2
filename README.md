# iTL七夕祭 / iTL桜まつり - 短冊アプリケーション

iTLの学園祭イベントで、来場者が短冊（七夕モード）や抱負（桜モード）を投稿し、会場スクリーンに掲示するためのWebアプリケーションです。

Vite + React + TanStack Router で構築したSPAで、Cloudflare Workers の静的アセット配信としてデプロイされます。

## プロダクト概要

- **カスタムドメイン**: `tanzaku.mizphses.com`
- **バックエンド**: [itl-marubu/tanzakuv2](https://github.com/itl-marubu/tanzakuv2)（Hono + Prisma + Cloudflare D1）。本リポジトリはフロントエンドのみを扱います。
- **対象ユーザー**
  - イベント来場者（学生・教職員・一般参加者）
  - 会場設営・企画担当者（スクリーン掲示・モデレーションを行う運営側）
- **利用シーン**
  - 会場に掲示したQRコードからアクセスし、その場で投稿
  - 会場スクリーンに `/tree` を表示し、投稿を時間経過で入れ替えながら上映
  - 運営が `/admin` から投稿のモデレーション・イベント管理・表示モード切り替えを実施

## フェスティバルモード

このアプリは1つのコードベースで2つのイベントモードを持ちます。文言・配色・カード意匠・BGM・背景がモードごとに切り替わります。

| モード | イベント名 | 投稿物 | 背景 | カード |
| --- | --- | --- | --- | --- |
| `tanabata` | iTL七夕祭 | 短冊 | 笹（`/sasa.webp`）+ 揺れアニメーション | 縦型 300×500、縦書き |
| `sakura` | iTL桜まつり | 抱負 | 桜（`/sakura-tree.webp`）+ 花びらパーティクル | 横型 375×225、横書き |

モードの決まり方（`src/lib/activeMode.tsx`）:

1. 起動時は `VITE_FESTIVAL_MODE`（ビルド時の環境変数）を初期値として使用
2. `FestivalModeProvider` が `GET /config` を取得し、レスポンスの `festivalMode` で上書き
3. `/tree` は60秒ごとに `/config` も再取得するため、管理画面から切り替えるとリロードなしで反映される
4. 不正値は `console.error` を出して現在値（初期値は `tanabata`）を維持

なお `__root.tsx` / `privacy` / `tos` の `head()` はモジュール評価時に実行されるため、そこだけは env 由来の初期値（`INITIAL_FESTIVAL_MODE`）を使います。`/tree` のタブタイトルは `document.title` を副作用で更新して実行時のモードに追従させています。

## 主な機能

- **投稿フォーム（`/`）**
  - メッセージ（最大14文字）と名前（最大8文字）を入力。残り文字数をインライン表示します。
  - メッセージは7文字ずつ2行に分割して描画されます（`src/lib/tanzakuText.ts`）。
- **プレビュー**
  - 送信前にモーダルで実際のカード描画を確認し、閉じて再編集できます。
- **SNS共有**
  - 投稿完了後、非表示のcanvasに描画したカード画像をdata URLとして取得し、共有ダイアログに表示します。
  - Web Share API が使える端末では画像付きで共有、非対応環境では X の intent URL を開きます。
  - Webフォント（Yuji Syuku）はサブセット分割されているため、描画対象テキストを渡して `document.fonts.load` の完了を待ってから描画・キャプチャします。
- **掲示ビュー（`/tree`）**
  - 背景（笹／桜）をcanvasに描画し、その上にカードを配置します。
  - 七夕モードは固定座標10枚、桜モードはビューポートに応じたセル分割＋幹回避＋最遠セル貪欲選択で14枚を配置します（`src/lib/treeLayout.ts`）。
  - 60秒ごとに `GET /tanzaku/client` を再取得して表示を入れ替えます。
  - 七夕モードでは1枚をランダムに特別イラスト（`/tanabata-ithiel.png`）へ差し替える演出があります。
  - 右ペインにロゴ・案内文・投稿用QRコードを表示し、初回クリック／タップ後にBGMをループ再生します。
  - `robots: noindex, nofollow` を指定しています。
- **管理画面（`/admin`）**
  - Basic認証でログイン。資格情報はReact Context（メモリ）にのみ保持し、`localStorage` / `sessionStorage` には保存しません（XSS時の露出を抑えるトレードオフとして、リロード時は再ログインになります）。
  - 投稿の一覧・検索・フィルタ（適切／不適切／削除済み、イベント別）・ソート・統計表示
  - 投稿の追加・編集・論理削除・物理削除、CSVエクスポート
  - イベントの作成・アクティブ化・一括非アクティブ化
  - フェスティバルモードの切り替え（`PUT /manage/config`）
- **静的ページ**
  - `/privacy`（個人情報保護方針）、`/tos`（ご利用規約）、および404ページ

## ルーティング

TanStack Router のファイルベースルーティング（`src/routes/`）です。`routeTree.gen.ts` は Vite プラグインが自動生成するため、手で編集しません。

| パス | ファイル | 内容 |
| --- | --- | --- |
| `/` | `routes/index.tsx` | 投稿フォーム |
| `/tree` | `routes/tree.tsx` | 会場掲示ビュー |
| `/admin` | `routes/admin/route.tsx` | Basic認証ゲート（未ログイン時はログインフォーム） |
| `/admin/` | `routes/admin/index.tsx` | 管理ダッシュボード |
| `/privacy` | `routes/privacy.tsx` | 個人情報保護方針 |
| `/tos` | `routes/tos.tsx` | ご利用規約 |
| （その他） | `components/NotFound.tsx` | 404 |

## 技術スタック

### フロントエンド

- **Vite 8** — 開発サーバー / ビルド。`@` エイリアスは `src` を指します。
- **React 19**
- **TanStack Router 1.x** — ファイルベースルーティング + 自動コード分割（`@tanstack/router-plugin/vite`）
- **Tailwind CSS 4** — `@tailwindcss/vite` プラグイン経由。スタイルは基本的にユーティリティクラスで記述し、共通定義とアニメーションのみ `src/styles/global.css` に置いています。
- **TypeScript 5.8** — `strict` 有効
- **openapi-fetch / openapi-typescript** — 公開API（`/tanzaku` 系）は生成型で型安全に呼び出します。バックエンドで並行実装中のエンドポイント（`/config`・`/manage/*`）は生成型に未収録のため、`src/api/adminClient.ts` などで手書き型を使用しています。
- **qrcode** — `/tree` の投稿用QRコード生成
- **Canvas 2D API** — カード描画（`src/lib/canvasDraw.ts`）と桜の花びらパーティクル（`src/lib/particles.ts`）

### 開発ツール

- **Biome 1.9** — リンター / フォーマッター。`src/routeTree.gen.ts` と `src/api/generated` は対象外です。
- **Vitest 4** — 純粋ロジック（配置計算・テキスト分割・パーティクル・モード解決・管理画面フィルタ）のユニットテスト。`environment: node`。

### デプロイ

- **Cloudflare Workers（Static Assets）** — `dist` をアセットとして配信し、`not_found_handling: "single-page-application"` でSPAフォールバックします。
- **Wrangler 4** — `wrangler.jsonc` で設定。カスタムドメイン `tanzaku.mizphses.com`。

### その他

- **Google Analytics（gtag）** — スニペットは `index.html` で読み込み、`send_page_view: false` にしたうえでルーター遷移時に `page_view` を送信します（`src/lib/ga.ts`、`src/main.tsx`）。
- **Google Fonts** — Lexend / Noto Sans JP / Yuji Syuku を `index.html` から読み込みます。

## 環境変数

Viteの慣習どおり `VITE_` プレフィックス付きの変数がビルド時に埋め込まれます。リポジトリには `.env.development` と `.env.production` がコミットされています。

| 変数 | 用途 |
| --- | --- |
| `VITE_TANZ_BACKEND` | バックエンドAPIのベースURL |
| `VITE_GA_ID` | Google Analytics 測定ID（`index.html` の `%VITE_GA_ID%` に展開） |
| `VITE_FESTIVAL_MODE` | フェスティバルモードの初期値（`tanabata` / `sakura`） |
| `VITE_BASEURL` | 現在コード上では未参照（過去の共有URL生成で使用していた残り） |

## プロジェクト構造

```
src/
├── main.tsx                 # エントリポイント（Router生成・GA page_view購読）
├── routeTree.gen.ts         # TanStack Router 自動生成（編集しない）
├── routes/                  # ファイルベースルーティング
│   ├── __root.tsx           # ルートレイアウト（FestivalModeProvider・head・404）
│   ├── index.tsx            # 投稿フォームページ
│   ├── tree.tsx             # 会場掲示ページ
│   ├── privacy.tsx / tos.tsx
│   └── admin/
│       ├── route.tsx        # Basic認証ゲート
│       └── index.tsx        # ダッシュボード
├── features/                # 画面ごとの機能コンポーネント
│   ├── post/                # Form / PreviewModal / Toast / TwitterDialog
│   ├── tree/                # TreeCanvas / MetaInfo / Logo / QrCode / SakuraPetalParticles
│   └── admin/               # ダッシュボード・テーブル・イベント・モード切替・CSV・フィルタ
├── components/              # 画面横断の共通UI
│   ├── TanzakuCanvas.tsx    # カード描画canvas（七夕・桜両対応）
│   ├── Navbar.tsx / Footer.tsx / NotFound.tsx
├── api/
│   ├── client.ts            # 公開API（openapi-fetch）+ GET /config
│   ├── adminClient.ts       # 管理API /manage/*（Basic認証・手書き型）
│   └── generated/types.ts   # OpenAPIから生成（編集しない）
├── lib/                     # フレームワーク非依存のロジック
│   ├── activeMode.tsx       # フェスティバルモードのContext・解決ロジック
│   ├── festivalMode.ts      # モード定義と文言テーブル
│   ├── adminAuth.tsx        # 管理画面の資格情報Context
│   ├── canvasDraw.ts        # カード描画（純粋関数）
│   ├── treeLayout.ts        # 掲示位置の計算（純粋関数）
│   ├── particles.ts         # 花びらパーティクル（純粋関数）
│   ├── tanzakuText.ts       # 文字数制限・行分割
│   └── ga.ts                # gtagラッパー
└── styles/global.css        # Tailwindのimportと共通アニメーション
```

描画・配置・フィルタなどのロジックは `src/lib` と `features/admin/*.ts` の純粋関数へ切り出し、Reactコンポーネントからは副作用（fetch・canvas・タイマー）だけを扱うようにしています。テストはこの純粋関数群を対象にしています。

## Getting Started

### 必要な環境

- Node.js 22.15.0（Voltaで固定）
- pnpm 10.10.0

### セットアップ

```bash
pnpm install
pnpm dev
```

開発サーバーは [http://localhost:5173](http://localhost:5173) で起動します（Viteの既定ポート）。`.env.development` が自動で読み込まれます。

### 型定義の生成

バックエンドリポジトリのOpenAPI定義を取得して型を再生成します。GitHub CLI（`gh`）の認証と `itl-marubu/tanzakuv2` への参照権限が必要です。

```bash
pnpm gen:api
```

`scripts/bin/openapi.yml` を更新し、`src/api/generated/types.ts` を再生成します。

## 利用可能なスクリプト

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | 開発サーバーを起動 |
| `pnpm build` | 本番用ビルド（`dist/`） |
| `pnpm preview` | ビルド結果をローカルでプレビュー |
| `pnpm test` | Vitest を1回実行 |
| `pnpm lint` | Biome のリント |
| `pnpm format` | Biome のフォーマットチェック |
| `pnpm fix` | Biome でリント・フォーマットを自動修正 |
| `pnpm typecheck` | `tsc --noEmit` による型チェック |
| `pnpm deploy` | ビルドして `wrangler deploy` |
| `pnpm gen:api` | OpenAPI定義の取得と型生成 |

## CI / デプロイ

### CI（`.github/workflows/ci.yaml`）

Pull Request と `main` への push で、`lint` / `typecheck` / `format` / `test` / `build` を並列実行します。

### デプロイ（`.github/workflows/deploy.yaml`）

`workflow_dispatch` の手動実行です。実行時に **フェスティバルモード**（`tanabata` / `sakura`）を選択し、それを `VITE_FESTIVAL_MODE` としてビルドに渡してから `wrangler deploy` します。デプロイ後に `vYYYY.MM.DD.HHmm` 形式のタグでGitHub Releaseを自動作成します。

必要なシークレット: `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。

ローカルからデプロイする場合は `pnpm deploy`（`.env.production` の値が使われます）。

### 設定ファイル

- `wrangler.jsonc`: Cloudflare Workers（静的アセット + SPAフォールバック + カスタムドメイン）
- `vite.config.ts`: TanStack Router / React / Tailwind プラグインと `@` エイリアス
- `vitest.config.ts`: テスト対象と実行環境
- `biome.json`: フォーマット・リント設定と除外パス

## API

公開APIは `openapi-fetch` を通じて型安全に呼び出します（`src/api/client.ts`）。管理APIはBasic認証ヘッダーを毎リクエスト手動付与する薄いfetchラッパーです（`src/api/adminClient.ts`）。

### フロントエンドが利用するエンドポイント

| エンドポイント | 用途 |
| --- | --- |
| `POST /tanzaku` | 投稿の作成 |
| `GET /tanzaku` | 投稿一覧の取得 |
| `GET /tanzaku/client?limit=` | 掲示ビュー用の取得（最大30件、既定10件） |
| `GET /config` | 現在のフェスティバルモード取得（認証不要） |
| `GET /manage/session` | 管理者資格情報の疎通確認（未デプロイ環境では `/manage/tanzakus` で代替確認） |
| `GET /manage/tanzakus` | 全投稿の取得 |
| `POST /manage/tanzakus` | 更新・論理削除・物理削除の一括操作 |
| `POST /manage/tanzakus/create` | 運営による投稿作成 |
| `GET /manage/events` | イベント一覧 |
| `POST /manage/events` | イベント作成 |
| `POST /manage/events/{id}/activate` | イベントのアクティブ化 |
| `POST /manage/events/deactivate-all` | 全イベントの非アクティブ化 |
| `PUT /manage/config` | フェスティバルモードの更新 |

## フォント

- **Noto Sans JP**: 本文の日本語テキスト
- **Lexend**: 見出し・ラテン文字
- **Yuji Syuku**: カード描画（canvas）の文字

## ライセンス

このプロジェクトはプライベートプロジェクトです。

## 参考リンク

- [Vite](https://vite.dev/)
- [TanStack Router](https://tanstack.com/router/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
