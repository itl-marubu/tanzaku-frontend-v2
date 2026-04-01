# iTL七夕祭 - 短冊アプリケーション

iTL七夕祭に短冊を飾るためのWebアプリケーションです。ユーザーは短冊にメッセージと名前を書いて投稿でき、投稿された短冊は竹に飾られて表示されます。

## プロダクト概要

- **タイトル**: iTL七夕祭  
  iTL（情報科学技術系の学部・コミュニティ）で開催される七夕祭向けに開発された、短冊投稿・閲覧のための専用Webアプリケーションです。
- **説明**: 「iTLに短冊を飾りましょう!」をコンセプトに、来場者がスマートフォンやPCから気軽に願い事を投稿し、会場のディスプレイやスクリーン上で竹に飾られた短冊として表示できる仕組みを提供します。
- **カスタムドメイン**: `tanzaku.mizphses.com`  
  Cloudflare Workers 上にデプロイされており、独自ドメインを用いて本番環境を公開します。
- **対象ユーザー**:  
  - 七夕祭の来場者（学生・教職員・一般参加者）  
  - 会場設営・企画担当者（スクリーンに短冊を映し出す運営側）
- **利用シーン**:  
  - 会場に設置したQRコードからアクセスし、その場で短冊を投稿  
  - 会場スクリーンに `/tree` ページを表示して、リアルタイムに増えていく短冊を上映

## 主な機能

- **短冊の作成・投稿**  
  - メッセージ（最大14文字）と名前（最大8文字）を入力し、画面上のフォームから短冊を作成・送信します。  
  - 文字数制限は、短冊画像のレイアウトが崩れないように調整されています（7文字ずつ2行に分割して描画されます）。
- **プレビュー機能**  
  - 送信前にモーダルダイアログで短冊の見た目を確認できます。  
  - 誤字や表現が気になる場合は、プレビュー画面を閉じて再編集が可能です。
- **短冊一覧表示（竹に飾るビュー）**  
  - `/tree` ページでは、背景に竹 (`/public/sasa.webp`) を描画し、その上にランダムな位置で複数の短冊画像を配置します。  
  - 短冊はサーバーから取得した最新データをもとに、一定間隔で更新されます。
- **Twitter共有**  
  - 投稿後、Canvas 上にレンダリングした短冊画像をもとにTwitter共有用の画像URLを生成します。  
  - 共有ダイアログから、ユーザーが自分の短冊をSNSに投稿できる導線を提供します。
- **認証機能**  
  - 管理者向けページでは、Googleアカウントを使ったログインボタンを用意しています。  
  - 認証済み管理者のみが閲覧・操作できる機能を増やしていくことを前提とした構成です。
- **管理画面**  
  - `/admin` ページでは、運営向けの管理インターフェースを提供する想定で、今後短冊のモデレーションや統計表示などを拡張可能な構造になっています。
- **リアルタイム更新**  
  - `/tree` ページでは、短冊データを1分ごとに再取得し、新しい投稿があれば自動で反映されます。  
  - 再読み込みを行わなくても、会場スクリーン上の表示が更新されるように設計されています。

## 技術スタック

### フロントエンド
- **Next.js 15.3.1 (App Router)**  
  - `src/app` ディレクトリを用いたApp Router構成で、`/`・`/auth`・`/tree`・`/admin` などのルートをページ単位で管理しています。  
  - サーバーコンポーネントとクライアントコンポーネントを併用しつつ、フォームやCanvas描画などインタラクティブな部分は `"use client"` コンポーネントとして実装しています。
- **React 19.1.0**  
  - Hooks（`useState`, `useEffect`, `useRef` など）を中心に構成し、短冊描画やAPI呼び出し、モーダルの開閉制御などを行っています。
- **TypeScript 5.8.3**  
  - APIレスポンスやフォームデータ、短冊オブジェクトなど、主要なデータ構造に型を付けることで、開発時の安全性と保守性を高めています。
- **Panda CSS**  
  - `styled-system/css` を利用し、コンポーネント内で宣言的にスタイルを記述しています。  
  - デザイントークンやユーティリティクラスを用いて、一貫した余白・フォント・カラーリングを実現しています。
- **SASS**  
  - `/tree` ページのアニメーションやレイアウトなど、一部の複雑なスタイルは `page.module.scss` として分離し、モジュールCSSとして適用しています。
- **React Hook Form**  
  - `src/app/_components/form.tsx` で使用しており、バリデーション（文字数制限）や入力状態の監視、送信処理をシンプルに記述しています。
- **Jotai**  
  - `src/lib/login.ts` でトークン管理用のAtomを定義し、 ログイン状態・リフレッシュトークンなどをローカルストレージに永続化できるようにしています。
- **openapi-fetch**  
  - OpenAPI仕様 (`scripts/bin/openapi.yml`) から生成された型定義 (`src/api/generated/types.ts`) をもとに、型安全なHTTPクライアントを構築しています。

### 開発ツール
- **Biome**  
  - フォーマッターとリンターとして導入されており、`pnpm lint` や `pnpm format` を通じてコードスタイルと品質を統一します。  
  - インデント幅やクオートスタイルなどは `biome.json` で管理しています。
- **OpenAPI TypeScript**  
  - バックエンドのOpenAPI仕様からTypeScriptの型定義を自動生成し、フロントエンドとバックエンドのインターフェースを同期させます。

### デプロイ
- **Cloudflare Workers**  
  - Next.jsアプリをEdge環境で実行することで、七夕祭の来場者がどの地域からアクセスしても高速なレスポンスを得られるようにしています。
- **OpenNext.js Cloudflare**  
  - Next.jsをWorkers環境に最適化してビルド・デプロイするためのツールチェーンです。  
  - `open-next.config.ts` でキャッシュ戦略などのカスタマイズが可能です。

### その他
- **Google Analytics**  
  - `NEXT_PUBLIC_GA_ID` を用いて、フォーム閲覧や短冊投稿などのイベントを計測し、ユーザー行動を可視化します。
- **next-qrcode**  
  - 会場に設置するQRコードを生成する用途で利用可能なライブラリです（必要に応じて `/tree` ページやLPなどに表示できます）。
- **Tabler Icons**  
  - UI上のアイコン表示に利用できるアイコンセットで、軽量かつ視認性の高いデザインが特徴です。

## 開発環境

- **Node.js: 22.15.0 (Voltaで管理)**  
  - `package.json` の `volta` セクションでバージョンを固定しており、開発者間でNode.jsのバージョン差による不具合を防ぎます。
- **pnpm: 10.10.0**  
  - 依存関係のインストールを高速かつ省容量で行うため、pnpmを採用しています。  
  - `pnpm-lock.yaml` により、依存関係のバージョンをプロジェクト全体で固定しています。
- **パッケージマネージャー**: pnpm 推奨  
  - `npm` や `yarn` でも実行可能ですが、想定されているのは `pnpm` です。

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router のエントリポイント群
│   ├── _components/        # トップページ専用コンポーネント（フォーム、モーダルなど）
│   ├── admin/              # 管理画面（運営向けUI）
│   ├── auth/               # 認証ページ（Googleログインなど）
│   ├── tree/               # 短冊一覧表示ページ（竹＋短冊のビジュアル表示）
│   └── page.tsx            # ホームページ（短冊作成フォーム）
├── components/             # 複数ページで共通利用するUIコンポーネント
│   ├── createTanzaku/      # Canvasを利用した短冊描画コンポーネント
│   ├── Footer.tsx          # フッター
│   └── Navbar.tsx          # ナビゲーションバー
├── api/                    # バックエンドとの通信レイヤー
│   ├── client.ts           # OpenAPI Fetch を利用したAPI呼び出し関数
│   └── generated/          # OpenAPIから生成された型定義
└── lib/                    # ロジック・ユーティリティ
    └── login.ts            # 認証・トークン管理関連
```

それぞれのディレクトリは関心ごとに分離されており、ページ・UIコンポーネント・APIクライアント・ユーティリティが明確に分かれています。そのため、新しいページや機能を追加する際も、どの階層にコードを配置すべきか判断しやすくなっています。

## Getting Started

### 必要な環境

- Node.js 22.15.0
- pnpm 10.10.0

### セットアップ

1. 依存関係のインストール:
```bash
pnpm install
```

2. 環境変数の設定:
`.env.local`ファイルを作成し、以下の環境変数を設定してください:
- `NEXT_PUBLIC_TANZ_BACKEND`: バックエンドAPIのURL
- `NEXT_PUBLIC_GA_ID`: Google Analytics ID（オプション）

3. 型定義の生成:
```bash
pnpm gen
```

### 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## 利用可能なスクリプト

- `pnpm dev`: 開発サーバーを起動
- `pnpm build`: 本番用ビルド
- `pnpm start`: 本番サーバーを起動
- `pnpm lint`: コードのリントチェック
- `pnpm format`: コードのフォーマット
- `pnpm typecheck`: TypeScriptの型チェック
- `pnpm fix`: リントとフォーマットを自動修正
- `pnpm gen`: 型定義の生成（Panda CSS、Cloudflare環境変数など）
- `pnpm gen:cf-type`: Cloudflare環境変数の型定義を生成
- `pnpm gen:panda`: Panda CSSの型定義を生成
- `pnpm build-opennextjs`: Cloudflare Workers用のビルド
- `pnpm deploy`: Cloudflare Workersにデプロイ
- `pnpm preview`: ローカルでCloudflare Workersのプレビュー

## デプロイ

このプロジェクトはCloudflare Workersにデプロイされます。

### デプロイ手順

1. Cloudflare Workers用のビルド:
```bash
pnpm build-opennextjs
```

2. デプロイ:
```bash
pnpm deploy
```

3. ローカルプレビュー:
```bash
pnpm preview
```

### 設定

- `wrangler.jsonc`: Cloudflare Workersの設定ファイル
- `open-next.config.ts`: OpenNext.js Cloudflareの設定ファイル
- カスタムドメイン: `tanzaku.mizphses.com`

## API

バックエンドAPIとの通信は`openapi-fetch`を使用して型安全に行われます。

### 主要なAPI関数

- `getTanzakuList()`: 短冊一覧を取得
- `createTanzaku(data)`: 短冊を作成
- `getClientTanzaku(limit?)`: クライアント表示用の短冊を取得（`limit` 未指定時は10件、最大30件）

APIの型定義は`scripts/bin/openapi.yml`から自動生成されます。

## フォント

以下のフォントが使用されています:

- **Noto Sans JP**: 日本語テキスト用
- **Lexend**: メインフォント
- **Yuji Syuku**: 短冊の文字描画用

## ライセンス

このプロジェクトはプライベートプロジェクトです。

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Panda CSS](https://panda-css.com/)
- [OpenNext.js Cloudflare](https://opennext.js.org/cloudflare)
- [Cloudflare Workers](https://workers.cloudflare.com/)
