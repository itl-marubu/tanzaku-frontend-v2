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

## 2. アクセス経路の分離

来場者と管理者ではアクセス経路が完全に分離されています。

```mermaid
graph LR
    subgraph visitors["来場者経路"]
        U["👤 来場者"]
        FE["Next.js Frontend\ntanzaku.mizphses.com"]
        API_TZ["Hono API\n/tanzaku"]
    end

    subgraph admins["管理者経路"]
        ADM["🔑 管理者"]
        MANAGE["Hono /manage\n(HTMLに包含されたUI)\ntanzakuv2.fuminori.workers.dev/manage"]
        BASIC["Basic認証\nADMIN_ID / ADMIN_PWD"]
    end

    U -->|"QRコード"| FE
    FE <-->|"REST API"| API_TZ

    ADM -->|"直接アクセス"| BASIC
    BASIC --> MANAGE

    style FE fill:#dbeafe
    style MANAGE fill:#fef3c7
    style BASIC fill:#fee2e2
```

| 層 | 経路 | 認証方式 | 主な機能 |
|---|---|---|---|
| 来場者 | `tanzaku.mizphses.com` → Next.js | なし | 短冊投稿・閲覧 |
| 管理者 | `tanzakuv2.fuminori.workers.dev/manage` → Hono直届けHTML | Basic認証 | 短冊管理・イベント管理 |

---

## 3. 主な機能

### 来場者向け（`tanzaku.mizphses.com`）

| 機能 | 詳細 |
|------|------|
| 短冊作成・投稿 | メッセージ（最大14文字）と名前（最大8文字）を入力して送信 |
| プレビュー | 送信前にモーダルで短冊の見た目を確認 |
| SNS共有 | 投稿後にCanvas描画した短冊画像をXへ共有 |
| 短冊閲覧 | `/tree` で竹に飾られた短冊をリアルタイム表示（1分ごと自動更新） |
| フェスティバルモード | `NEXT_PUBLIC_FESTIVAL_MODE` 環境変数で「七夕」/「桜まつり」を切替 |

### 管理者向け（`tanzakuv2.fuminori.workers.dev/manage`）

管理画面はHonoバックエンドが**HTML/CSS/JavaScriptを直接返却**する構成で、Basic認証で保護されています。

| 機能 | 詳細 |
|------|------|
| 短冊一覧 | 全短冊を表示。検索・フィルタ・ソート対応 |
| 短冊編集・削除 | 個別・一括の編集・論理削除・完全削除 |
| バリデーション切替 | AI審査結果（適切/不適切）を手動で修正 |
| イベント管理 | 複数イベントの作成・有効化・切替 |
| CSV出力 | 表示中の短冊データをCSVダウンロード |
| 新規作成 | 管理画面から直接短冊を作成（AI審査なし） |

---

## 4. システム全体構成図

```mermaid
graph TB
    subgraph Visitor["来場者"]
        U["👤 来場者"]
    end

    subgraph Admin["管理者"]
        ADM["🔑 管理者"]
    end

    subgraph CF_FE["Cloudflare Workers — フロントエンド"]
        FE["Next.js 15 App\n(OpenNext.js Cloudflare)\ntanzaku.mizphses.com"]
    end

    subgraph CF_BE["Cloudflare Workers — バックエンド"]
        BE_TZ["Hono /tanzaku\n来場者向けAPI"]
        BE_AUTH["Hono /auth\n認証 API"]
        BE_MANAGE["Hono /manage\n管理画面 (HTML同居)\nBasic認証"]
        AI["Cloudflare AI\n(Llama 3.3 70B)"]
    end

    subgraph CF_DB["Cloudflare D1"]
        DB[("SQLite Database\nTANZAKU-V2")]
    end

    subgraph External["外部サービス"]
        Google["Google OAuth 2.0\n(認証フロー用）"]
        GA["Google Analytics"]
        Twitter["X (Twitter) 共有"]
    end

    U -->|"QRコード"| FE
    FE <-->|"REST API (HTTPS)"| BE_TZ
    FE -->|"Google OAuth"| BE_AUTH
    BE_AUTH <--> Google

    ADM -->|"Basic認証\n直接アクセス"| BE_MANAGE

    BE_TZ & BE_AUTH & BE_MANAGE --> DB
    BE_TZ -.->|"コンテンツ審査"| AI
    FE --> GA
    FE --> Twitter

    style FE fill:#dbeafe,stroke:#3b82f6
    style BE_TZ fill:#fef3c7,stroke:#f59e0b
    style BE_MANAGE fill:#fef3c7,stroke:#f59e0b
    style BE_AUTH fill:#fef3c7,stroke:#f59e0b
    style DB fill:#d1fae5,stroke:#10b981
    style AI fill:#ede9fe,stroke:#7c3aed
    style BE_MANAGE stroke-width:3px,stroke:#ef4444
```

---

## 5. フロントエンド詳細構成図

```mermaid
graph TB
    subgraph Pages["ページ (src/app)"]
        P_HOME["/\n短冊投稿フォーム"]
        P_TREE["/tree\n短冊一覧（竹）表示"]
        P_ADMIN["/admin\nフェスティバルモード表示"]
        P_AUTH["/auth\n認証コールバック"]
        P_PRIV["/privacy\nプライバシー"]
        P_TOS["/tos\n利用規約"]
    end

    subgraph HomeComp["ホームページコンポーネント"]
        Form["form.tsx\n投稿フォーム (React Hook Form)"]
        Preview["PreviewModal.tsx"]
        Toast["Toast.tsx"]
        TwDlg["TwitterDialog.tsx"]
    end

    subgraph TreeComp["Treeページコンポーネント"]
        T2I["t2i.tsx\n短冊→Canvas描画"]
        Meta["meta.tsx"]
        QR["QrCode.tsx"]
    end

    subgraph Shared["共通"]
        Tanzaku["createTanzaku/"]
        Navbar["Navbar.tsx"]
        Footer["Footer.tsx"]
    end

    subgraph Infra["インフラ層"]
        APIClient["src/api/client.ts\nopenapi-fetch"]
        Types["src/api/generated/types.ts"]
        Auth["src/lib/login.ts\nJotai トークン管理"]
        FestMode["src/lib/festivalModeAtom.ts\nJotai モード管理"]
    end

    P_HOME --> Form & Navbar & Footer
    P_TREE --> T2I & Meta & QR
    P_ADMIN --> FestMode
    P_AUTH --> Auth

    Form --> Preview & Toast & TwDlg & APIClient
    T2I --> APIClient & Tanzaku
    APIClient --> Types
    Auth --> APIClient

    style P_HOME fill:#dbeafe
    style P_TREE fill:#dbeafe
    style P_ADMIN fill:#f3f4f6
    style APIClient fill:#fef3c7
```

> **注意**: フロントエンドの `/admin` はフェスティバルモードの表示のみであり、**短冊管理画面はバックエンドの `/manage`** に実装されています。

---

## 6. バックエンド詳細構成図

```mermaid
graph TB
    subgraph HonoApp["Hono Application (src/index.ts)"]
        CORS["CORS ミドルウェア"]
    end

    subgraph PublicRoutes["公開ルート（認証不要）"]
        R_TZ["/tanzaku"]
        R_AUTH["/auth"]
    end

    subgraph ProtectedRoute["保護ルート（Basic認証）"]
        R_MANAGE["/manage"]
        BASIC_MW["basicAuthミドルウェア\nADMIN_ID / ADMIN_PWD"]
        MANAGE_HTML["GET / → HTML返却\n管理画面UI"]
        MANAGE_API["GET /tanzakus\nPOST /tanzakus\nPOST /tanzakus/create"]
        EVENT_API["GET /events\nPOST /events\nPOST /events/:id/activate\nPOST /events/deactivate-all"]
    end

    subgraph TanzakuEndpoints["短冊 API"]
        T1["GET /tanzaku"]
        T2["POST /tanzaku + AI審査"]
        T3["GET /tanzaku/check/:id"]
        T4["GET /tanzaku/client"]
    end

    subgraph AuthEndpoints["認証 API"]
        A1["GET /auth/google"]
        A2["POST /auth/signup"]
        A3["POST /auth/login"]
        A4["POST /auth/refresh"]
    end

    subgraph Services["サービス層"]
        TS["TanzakuService"]
        AS["AuthService"]
        ES["EventService"]
    end

    subgraph CF["Cloudflare"]
        D1[("D1 Database")]
        CFAI["Cloudflare AI"]
    end

    HonoApp --> CORS --> PublicRoutes & ProtectedRoute
    R_MANAGE --> BASIC_MW --> MANAGE_HTML & MANAGE_API & EVENT_API
    R_TZ --> T1 & T2 & T3 & T4
    R_AUTH --> A1 & A2 & A3 & A4

    T1 & T3 & T4 --> TS
    T2 --> TS
    T2 -.-> CFAI
    A1 & A2 & A3 & A4 --> AS
    MANAGE_API --> TS
    EVENT_API --> ES

    TS & AS & ES --> D1

    style BASIC_MW fill:#fee2e2
    style MANAGE_HTML fill:#fef3c7
    style CFAI fill:#ede9fe
    style D1 fill:#d1fae5
```

---

## 7. データモデル（ERD）

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

## 8. 主要データフロー

### 短冊投稿フロー

```mermaid
sequenceDiagram
    actor User as 来場者
    participant FE as Next.js Frontend
    participant API as Hono /tanzaku
    participant AI as Cloudflare AI
    participant DB as D1 Database

    User->>FE: メッセージ・名前を入力
    FE->>FE: バリデーション（content≤14文字）
    FE->>FE: プレビューモーダル表示
    User->>FE: 送信確定
    FE->>API: POST /tanzaku {content, userName}
    API->>AI: Llama 3.3 70Bでコンテンツ審査
    AI-->>API: {result: 0 or 1}
    API->>DB: INSERT INTO Tanzaku (validationResult付き)
    DB-->>API: 作成されたTanzakuレコード
    API-->>FE: JSON Response
    FE->>User: 完了通知 + X共有ダイアログ
```

### 短冊表示フロー（/tree ページ）

```mermaid
sequenceDiagram
    actor Screen as 会場スクリーン
    participant FE as Next.js /tree
    participant API as Hono /tanzaku/client
    participant DB as D1 Database

    Screen->>FE: /tree ページアクセス
    FE->>API: GET /tanzaku/client?limit=10
    Note over API,DB: visiblePattern=trueのものを取得
    API->>DB: SELECT WHERE visiblePattern=true AND validationResult=0 AND logicalDelete=false
    DB-->>API: Tanzaku[]
    API->>DB: UPDATE visiblePattern=false（取得済みに）
    Note over API,DB: 全件表示済みなら全レコードをリセット
    API-->>FE: Tanzaku[] JSON
    FE->>FE: Canvasで短冊描画（竹背景）
    FE->>Screen: 短冊表示
    Note over FE,Screen: 1分ごと自動更新
```

### 管理者アクセスフロー（Basic認証）

```mermaid
sequenceDiagram
    actor Admin as 管理者
    participant Browser as ブラウザ
    participant Hono as Hono /manage
    participant DB as D1 Database

    Admin->>Browser: tanzakuv2.fuminori.workers.dev/manage にアクセス
    Browser->>Hono: GET /manage
    Hono->>Browser: 401 Basic認証チャレンジ
    Browser->>Admin: ID/パスワード入力ダイアログ
    Admin->>Browser: ADMIN_ID / ADMIN_PWDを入力
    Browser->>Hono: GET /manage (Basic認証ヘッダ付き)
    Hono->>Browser: 管理画面HTMLを返却
    Note over Browser,Hono: 以降、ブラウザから直接API呼び出し
    Browser->>Hono: GET /manage/tanzakus
    Hono->>DB: SELECT all tanzakus
    DB-->>Hono: Tanzaku[]
    Hono-->>Browser: JSON
    Browser->>Browser: 管理画面に表示
```

---

## 9. APIエンドポイント一覧

### 来場者向け短冊 API (`/tanzaku`)

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| GET | `/tanzaku` | 不要 | 全短冊取得（イベント情報含む） |
| POST | `/tanzaku` | 不要 | 短冊作成（AI審査付き） |
| GET | `/tanzaku/check/:id` | 不要 | ID指定で短冊取得 |
| GET | `/tanzaku/client` | 不要 | 表示用取得（循環ローテーション、`?limit=N`） |

### 認証 API (`/auth`)

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/auth/google` | Google OAuth 開始 |
| POST | `/auth/signup` | メールアドレス登録 |
| POST | `/auth/login` | メールアドレスログイン |
| POST | `/auth/refresh` | アクセストークン更新 |

### 管理者向け API (`/manage`) — Basic認証必須

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/manage` | 管理画面HTMLを返却 |
| GET | `/manage/tanzakus` | 全短冊取得 |
| POST | `/manage/tanzakus` | 短冊編集・論理削除・完全削除 |
| POST | `/manage/tanzakus/create` | 短冊新規作成（AI審査なし） |
| GET | `/manage/events` | イベント一覧取得 |
| POST | `/manage/events` | イベント作成 |
| POST | `/manage/events/:id/activate` | イベントをアクティブ化 |
| POST | `/manage/events/deactivate-all` | 全イベントを無効化 |

---

## 10. 技術スタック

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
| 認証(管理画面) | Basic認証 (Hono basicAuth) | — |
| 認証(JWT) | JWT + Google OAuth (@hono/oauth-providers) | — |
| パスワード | bcryptjs | — |
| AI審査 | Cloudflare AI (Llama 3.3 70B fp8) | — |
| API仕様 | OpenAPI 3.0 | — |
| Linter/Formatter | Biome | — |
| パッケージ管理 | pnpm | — |

---

## 11. デプロイ構成

```mermaid
graph LR
    subgraph GitHub["GitHub"]
        FE_Repo["tanzaku-frontend-v2"]
        BE_Repo["tanzakuv2"]
    end

    subgraph CF["Cloudflare"]
        CF_FE["Workers\ntanzaku.mizphses.com"]
        CF_BE["Workers\ntanzakuv2.fuminori.workers.dev"]
        D1[("D1\nTANZAKU-V2")]
        CF_AI["Cloudflare AI"]
    end

    FE_Repo -->|"pnpm build-opennextjs && deploy"| CF_FE
    BE_Repo -->|"pnpm deploy"| CF_BE
    CF_BE --- D1
    CF_BE --- CF_AI
    CF_FE <-->|"HTTPS"| CF_BE

    style CF_FE fill:#dbeafe
    style CF_BE fill:#fef3c7
    style D1 fill:#d1fae5
    style CF_AI fill:#ede9fe
```

---

## 12. 環境変数

### フロントエンド

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_TANZ_BACKEND` | バックエンドAPIのベースURL |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 計測ID（任意） |
| `NEXT_PUBLIC_FESTIVAL_MODE` | `tanabata` または `sakura`（フェスティバル切替） |

### バックエンド（Cloudflare Workers Bindings）

| Binding / 変数名 | 説明 |
|-----------------|------|
| `DB` | Cloudflare D1 Binding |
| `AI` | Cloudflare AI Binding |
| `JWT_SECRET` | JWT署名シークレット |
| `FRONTEND_BASEURL` | フロントエンドのベースURL（OAuth リダイレクト用） |
| `ADMIN_ID` | 管理画面Basic認証のユーザー名 |
| `ADMIN_PWD` | 管理画面Basic認証のパスワード |
