# iTL七夕祭 短冊システム — システム説明書

> 対象リポジトリ: `tanzakuv2`（バックエンド）/ `tanzaku-frontend-v2`（フロントエンド）

---

## 1. システム概要

iTL七夕祭に来場した参加者が、スマートフォンやPCから「短冊」にメッセージと名前を書いて投稿し、会場スクリーンに竹へ飾られた短冊としてリアルタイムで表示するWebアプリケーション。

| 項目 | 内容 |
|------|------|
| サービス名 | iTL七夕祭 短冊アプリ |
| フロントエンドURL | `tanzaku.mizphses.com` |
| バックエンドURL | `tanzakuv2.fuminori.workers.dev` |
| 対象ユーザー | 七夕祭来場者・運営管理者 |
| 主な利用シーン | QRコードで来場者がアクセスして短冊投稿、会場スクリーンに `/tree` を表示して短冊をリアルタイム上映 |

---

## 2. 主な機能

### 来場者向け

| 機能 | 詳細 |
|------|------|
| 短冊作成・投稿 | メッセージ（最大14文字）と名前（最大8文字）を入力して送信 |
| プレビュー | 送信前にモーダルで短冊の見た目を確認 |
| SNS共有 | 投稿後にCanvas描画した短冊画像をXへ共有 |
| 短冊閲覧 | `/tree` で竹に飾られた短冊をリアルタイム表示（1分ごと自動更新） |

### 管理者向け

| 機能 | 詳細 |
|------|------|
| 管理画面 | `/admin` から短冊の確認・編集・削除 |
| 認証 | Googleアカウントによるログイン |
| イベント管理 | 複数イベントの切替・有効化 |
| AIコンテンツ審査 | Cloudflare AI（Llama 3.3 70B）による投稿内容の自動判定 |

---

## 3. システム全体構成図

```mermaid
graph TB
    subgraph User["来場者 / 管理者"]
        U["👤 来場者"]
        ADM["🔑 管理者"]
    end

    subgraph CF_FE["Cloudflare Workers — フロントエンド"]
        FE["Next.js 15 App\n(OpenNext.js Cloudflare)\ntanzaku.mizphses.com"]
    end

    subgraph CF_BE["Cloudflare Workers — バックエンド"]
        BE["Hono API Server\ntanzakuv2.fuminori.workers.dev"]
        AI["Cloudflare AI\n(Llama 3.3 70B)"]
    end

    subgraph CF_DB["Cloudflare D1"]
        DB[("SQLite Database\nTANZAKU-V2")]
    end

    subgraph External["外部サービス"]
        Google["Google OAuth 2.0"]
        GA["Google Analytics"]
        Twitter["X (Twitter) 共有"]
    end

    U -->|"QRコードでアクセス"| FE
    ADM -->|"管理画面アクセス"| FE
    FE <-->|"REST API (HTTPS)"| BE
    BE <-->|"Prisma ORM"| DB
    BE -->|"コンテンツ審査"| AI
    BE <-->|"OAuth認証"| Google
    FE -->|"イベント計測"| GA
    FE -->|"短冊画像共有"| Twitter

    style FE fill:#dbeafe,stroke:#3b82f6
    style BE fill:#fef3c7,stroke:#f59e0b
    style DB fill:#d1fae5,stroke:#10b981
    style AI fill:#ede9fe,stroke:#7c3aed
```

---

## 4. フロントエンド詳細構成図

```mermaid
graph TB
    subgraph Pages["ページ (src/app)"]
        P_HOME["/\n短冊投稿フォーム"]
        P_TREE["/tree\n短冊一覧（竹）表示"]
        P_ADMIN["/admin\n管理画面"]
        P_AUTH["/auth\n認証コールバック"]
        P_PRIV["/privacy\nプライバシーポリシー"]
        P_TOS["/tos\n利用規約"]
    end

    subgraph HomeComp["ホームページコンポーネント"]
        Form["form.tsx\n投稿フォーム\n(React Hook Form)"]
        Preview["PreviewModal.tsx\nプレビュー"]
        Toast["Toast.tsx\n通知"]
        TwDlg["TwitterDialog.tsx\nX共有ダイアログ"]
    end

    subgraph TreeComp["Treeページコンポーネント"]
        T2I["t2i.tsx\n短冊→Canvas描画"]
        Meta["meta.tsx\nメタ情報"]
        QR["QrCode.tsx\nQRコード"]
    end

    subgraph Shared["共通コンポーネント"]
        Tanzaku["createTanzaku/\n短冊Canvasコンポーネント"]
        Navbar["Navbar.tsx"]
        Footer["Footer.tsx"]
    end

    subgraph Infra["インフラ層"]
        APIClient["src/api/client.ts\nopenapi-fetch"]
        Types["src/api/generated/types.ts\nOpenAPI自動生成型"]
        Auth["src/lib/login.ts\nJotai 認証トークン管理"]
    end

    P_HOME --> Form
    P_HOME --> Navbar
    P_HOME --> Footer
    P_TREE --> T2I
    P_TREE --> Meta
    P_TREE --> QR
    P_ADMIN --> Auth
    P_AUTH --> Auth

    Form --> Preview
    Form --> Toast
    Form --> TwDlg
    Form --> APIClient
    T2I --> APIClient
    T2I --> Tanzaku
    P_ADMIN --> APIClient

    APIClient --> Types
    Auth --> APIClient

    style P_HOME fill:#dbeafe
    style P_TREE fill:#dbeafe
    style P_ADMIN fill:#fce7f3
    style APIClient fill:#fef3c7
```

---

## 5. バックエンド詳細構成図

```mermaid
graph TB
    subgraph HonoApp["Hono Application (src/index.ts)"]
        CORS["CORS ミドルウェア\n(全エンドポイント)"]
    end

    subgraph Routes["ルーティング"]
        R_TZ["/tanzaku"]
        R_AUTH["/auth"]
        R_MANAGE["/manage"]
    end

    subgraph TanzakuEndpoints["短冊 API"]
        T1["GET /tanzaku\n全件取得"]
        T2["POST /tanzaku\n短冊作成 + AI審査"]
        T3["GET /tanzaku/check/:id\nID指定取得"]
        T4["GET /tanzaku/client\n表示用取得 (循環ローテーション)"]
    end

    subgraph AuthEndpoints["認証 API"]
        A1["GET /auth/google\nGoogle OAuth開始"]
        A2["POST /auth/signup\nメール登録"]
        A3["POST /auth/login\nメールログイン"]
        A4["POST /auth/refresh\nトークン更新"]
    end

    subgraph ManageEndpoints["管理 API (JWT必須)"]
        M1["管理者向け\n短冊一覧・編集・削除"]
        M2["イベント管理"]
    end

    subgraph Services["サービス層"]
        TS["TanzakuService\nsrc/services/tanzaku.service.ts"]
        AS["AuthService\nsrc/services/auth.service.ts"]
        ES["EventService\nsrc/services/event.service.ts"]
    end

    subgraph DataLayer["データアクセス層"]
        Prisma["Prisma Client\n(PrismaD1 アダプター)"]
    end

    subgraph CFServices["Cloudflare サービス"]
        D1[("D1 Database")]
        CFAI["Cloudflare AI\n(Llama 3.3 70B fp8)"]
    end

    HonoApp --> CORS
    CORS --> R_TZ
    CORS --> R_AUTH
    CORS --> R_MANAGE

    R_TZ --> T1 & T2 & T3 & T4
    R_AUTH --> A1 & A2 & A3 & A4
    R_MANAGE --> M1 & M2

    T1 & T3 & T4 --> TS
    T2 --> TS
    T2 -.->|"コンテンツ審査"| CFAI
    A1 & A2 & A3 & A4 --> AS
    M1 --> TS
    M2 --> ES

    TS & AS & ES --> Prisma
    Prisma --> D1

    style CFAI fill:#ede9fe
    style D1 fill:#d1fae5
    style Prisma fill:#fef3c7
```

---

## 6. データモデル（ERD）

```mermaid
erDiagram
    AdminUser {
        String id PK "UUID"
        String email UK
        String password "nullable"
        DateTime createdAt
        DateTime updatedAt
    }

    GoogleOauth {
        String id PK "GoogleユーザーID"
        String email UK
        String userId FK
        DateTime createdAt
        DateTime updatedAt
    }

    GitHubOauth {
        Int id PK "GitHubユーザーID"
        String email UK
        String userId FK
        DateTime createdAt
        DateTime updatedAt
    }

    RefreshToken {
        String id PK "cuid"
        String token UK
        DateTime expiresAt "30日有効"
        DateTime createdAt
        DateTime updatedAt
        String userId FK
    }

    Event {
        String id PK "UUID"
        String name
        String description "nullable"
        Boolean isActive "同時に1件のみtrue"
        DateTime createdAt
    }

    Tanzaku {
        String id PK "UUID"
        String content "最大14文字"
        String userName "投稿者名"
        Boolean visiblePattern "表示ローテーション管理"
        Int validationResult "0=適切 / 1=不適切"
        Boolean logicalDelete "論理削除フラグ"
        DateTime createdAt
        String eventId FK "nullable"
    }

    AdminUser ||--o| GoogleOauth : "1対1"
    AdminUser ||--o| GitHubOauth : "1対1"
    AdminUser ||--o{ RefreshToken : "1対多"
    Event ||--o{ Tanzaku : "1対多"
```

---

## 7. 主要データフロー

### 短冊投稿フロー

```mermaid
sequenceDiagram
    actor User as 来場者
    participant FE as Next.js フロントエンド
    participant API as Hono API
    participant AI as Cloudflare AI
    participant DB as D1 Database

    User->>FE: メッセージ・名前を入力
    FE->>FE: React Hook Form バリデーション<br/>(content ≤14文字, name ≤8文字)
    FE->>FE: プレビューモーダル表示
    User->>FE: 送信確定
    FE->>API: POST /tanzaku {content, userName}
    API->>AI: Llama 3.3 70B でコンテンツ審査<br/>結果: 0=適切 / 1=不適切
    AI-->>API: {result: 0 or 1}
    API->>DB: INSERT INTO Tanzaku<br/>(validationResult付き)
    DB-->>API: 作成されたTanzakuレコード
    API-->>FE: 201 JSON Response
    FE->>FE: Canvas に短冊描画
    FE->>User: 完了通知 + X共有ダイアログ表示
```

### 短冊表示フロー（/tree ページ）

```mermaid
sequenceDiagram
    actor Screen as 会場スクリーン
    participant FE as Next.js /tree
    participant API as Hono API
    participant DB as D1 Database

    Screen->>FE: /tree ページアクセス
    FE->>API: GET /tanzaku/client?limit=10
    Note over API,DB: アクティブイベントでフィルタ<br/>visiblePattern=true のもの取得
    API->>DB: SELECT Tanzaku WHERE visiblePattern=true<br/>AND validationResult=0 AND logicalDelete=false
    DB-->>API: Tanzaku[]
    API->>DB: UPDATE visiblePattern=false (取得済みを非表示化)
    Note over API,DB: 全件表示済みになったら<br/>全レコードをvisiblePattern=trueにリセット
    API-->>FE: Tanzaku[] JSON
    FE->>FE: Canvasで短冊画像を描画<br/>背景(竹)にランダム配置
    FE->>Screen: 短冊ビジュアル表示
    Note over FE,Screen: 1分ごとに自動再取得・更新
```

### 管理者認証フロー（Google OAuth）

```mermaid
sequenceDiagram
    actor Admin as 管理者
    participant FE as Next.js フロントエンド
    participant API as Hono API
    participant Google as Google OAuth
    participant DB as D1 Database

    Admin->>FE: /auth ページ → Googleログインボタン
    FE->>API: GET /auth/google
    API->>Google: OAuth認証要求 (openid, email, profile)
    Google-->>Admin: Googleログイン画面
    Admin->>Google: 認証完了
    Google-->>API: ユーザー情報
    API->>DB: GoogleOauth レコード確認 / 新規作成
    API->>DB: AdminUser 取得 / 作成
    API->>API: AccessToken (JWT) + RefreshToken 生成
    API->>DB: RefreshToken 保存 (30日有効)
    API-->>FE: /auth/google?accessToken=...&refreshToken=...
    FE->>FE: Jotai に トークン保存 (localStorage)
    FE->>Admin: 管理画面 (/admin) へリダイレクト
```

---

## 8. APIエンドポイント一覧

### 短冊 API (`/tanzaku`)

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| GET | `/tanzaku` | 不要 | 全短冊取得（イベント情報含む） |
| POST | `/tanzaku` | 不要 | 短冊作成（AI審査付き） |
| GET | `/tanzaku/check/:id` | 不要 | ID指定で短冊取得 |
| GET | `/tanzaku/client` | 不要 | 表示用短冊取得（循環ローテーション、`?limit=N`） |

### 認証 API (`/auth`)

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| GET | `/auth/google` | 不要 | Google OAuth 開始 |
| POST | `/auth/signup` | 不要 | メールアドレス登録 |
| POST | `/auth/login` | 不要 | メールアドレスログイン |
| POST | `/auth/refresh` | 不要（refreshToken） | アクセストークン更新 |

### 管理 API (`/manage`)

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| GET/POST | `/manage/*` | JWT必須 | 短冊編集・削除・イベント管理など |

---

## 9. 技術スタック

### フロントエンド (tanzaku-frontend-v2)

| カテゴリ | ライブラリ / ツール | バージョン |
|----------|---------------------|------------|
| フレームワーク | Next.js (App Router) | 15.3.1 |
| UIライブラリ | React | 19.1.0 |
| 言語 | TypeScript | 5.8.3 |
| スタイリング | Panda CSS | 0.53.7 |
| 状態管理 | Jotai | 2.12.5 |
| フォーム | React Hook Form | 7.56.4 |
| APIクライアント | openapi-fetch | 0.14.0 |
| 型生成 | openapi-typescript | 7.8.0 |
| アイコン | Tabler Icons | 3.33.0 |
| QRコード | next-qrcode | 2.5.1 |
| 分析 | Google Analytics | — |
| Linter/Formatter | Biome | — |
| デプロイ | Cloudflare Workers (OpenNext.js) | — |
| ドメイン | tanzaku.mizphses.com | — |

### バックエンド (tanzakuv2)

| カテゴリ | ライブラリ / ツール | バージョン |
|----------|---------------------|------------|
| ランタイム | Cloudflare Workers | — |
| フレームワーク | Hono | — |
| ORM | Prisma (PrismaD1アダプター) | — |
| データベース | Cloudflare D1 (SQLite) | — |
| 認証 | JWT + Google OAuth (@hono/oauth-providers) | — |
| パスワード | bcryptjs | — |
| AI審査 | Cloudflare AI (Llama 3.3 70B fp8) | — |
| API仕様 | OpenAPI 3.0 | — |
| Linter/Formatter | Biome | — |
| パッケージ管理 | pnpm | — |

---

## 10. デプロイ構成

```mermaid
graph LR
    subgraph GitHub["GitHub リポジトリ"]
        FE_Repo["tanzaku-frontend-v2"]
        BE_Repo["tanzakuv2"]
    end

    subgraph CF["Cloudflare"]
        CF_FE["Workers\n(フロントエンド)\ntanzaku.mizphses.com"]
        CF_BE["Workers\n(バックエンド)\ntanzakuv2.fuminori.workers.dev"]
        D1[("D1 Database\nTANZAKU-V2")]
        CF_AI["Cloudflare AI\n(AI Binding)"]        
    end

    FE_Repo -->|"pnpm build-opennextjs\npnpm deploy"| CF_FE
    BE_Repo -->|"pnpm deploy"| CF_BE
    CF_BE <-->|"D1 Binding"| D1
    CF_BE <-->|"AI Binding"| CF_AI
    CF_FE <-->|"HTTPS"| CF_BE

    style CF_FE fill:#dbeafe
    style CF_BE fill:#fef3c7
    style D1 fill:#d1fae5
    style CF_AI fill:#ede9fe
```

### デプロイ手順

**フロントエンド**
```bash
pnpm build-opennextjs   # OpenNext.js形式でビルド
pnpm deploy             # Cloudflare Workers にデプロイ
```

**バックエンド**
```bash
pnpm deploy             # Cloudflare Workers にデプロイ
```

---

## 11. 環境変数

### フロントエンド

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_TANZ_BACKEND` | バックエンドAPIのベースURL |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 計測ID（任意） |

### バックエンド（Cloudflare Workers Bindings）

| Binding / 変数名 | 説明 |
|-----------------|------|
| `DB` | Cloudflare D1 データベース (database_id: `2dfe24a8-...`) |
| `AI` | Cloudflare AI Binding |
| `JWT_SECRET` | JWT署名シークレット |
| `FRONTEND_BASEURL` | フロントエンドのベースURL（OAuth リダイレクト用） |
