# 短冊システム v2 アーキテクチャ構成図

## システム全体構成

```mermaid
graph TB
    subgraph "ユーザー"
        U[ユーザー]
        A[管理者]
    end

    subgraph "フロントエンド (tanzaku-frontend-v2)"
        subgraph "Next.js 15 App Router"
            HP["/home<br/>短冊投稿フォーム"]
            TP["/tree<br/>短冊表示画面"]
            AP["/admin<br/>管理者画面"]
            AP2["/auth<br/>認証画面"]
        end
        
        subgraph "コンポーネント"
            F[Form<br/>投稿フォーム]
            T2I[TanzakuToImage<br/>短冊表示]
            TD[TwitterDialog<br/>SNS共有]
            M[MetaInfo<br/>メタ情報]
        end
        
        subgraph "API Client"
            AC[API Client<br/>openapi-fetch]
        end
        
        subgraph "状態管理"
            J[Jotai<br/>認証トークン管理]
        end
        
        subgraph "スタイリング"
            PC[Panda CSS<br/>CSS-in-JS]
        end
    end

    subgraph "デプロイ環境"
        CFW[Cloudflare Workers<br/>OpenNext.js Cloudflare]
    end

    subgraph "バックエンド (tanzakuv2)"
        subgraph "Cloudflare Workers"
            H[Hono Framework<br/>API Server]
        end
        
        subgraph "API エンドポイント"
            TZ["/tanzaku<br/>短冊CRUD"]
            AUTH["/auth<br/>認証"]
            ADM["/admin<br/>管理者機能"]
        end
        
        subgraph "データ層"
            D1[Cloudflare D1<br/>SQL Database]
            PR[Prisma ORM<br/>データアクセス]
        end
    end

    U --> HP
    U --> TP
    A --> AP
    A --> AP2
    
    HP --> F
    TP --> T2I
    F --> TD
    TP --> M
    
    F --> AC
    T2I --> AC
    AP --> AC
    AP2 --> AC
    
    AC -->|HTTPS| H
    J --> AC
    
    CFW --> HP
    CFW --> TP
    CFW --> AP
    CFW --> AP2
    
    H --> TZ
    H --> AUTH
    H --> ADM
    
    TZ --> PR
    AUTH --> PR
    ADM --> PR
    
    PR --> D1

    style HP fill:#e1f5ff
    style TP fill:#e1f5ff
    style AP fill:#ffe1f5
    style H fill:#fff4e1
    style D1 fill:#e1ffe1
```

## フロントエンド詳細構成

```mermaid
graph LR
    subgraph "src/app"
        P1[page.tsx<br/>ホームページ]
        P2[tree/page.tsx<br/>短冊表示]
        P3[admin/page.tsx<br/>管理者画面]
        P4[auth/google/page.tsx<br/>Google認証]
        L[layout.tsx<br/>ルートレイアウト]
    end
    
    subgraph "src/app/_components"
        F[form.tsx<br/>投稿フォーム]
        PM[PreviewModal.tsx<br/>プレビュー]
        T[Toast.tsx<br/>通知]
        TD[TwitterDialog.tsx<br/>SNS共有]
    end
    
    subgraph "src/app/tree/_components"
        T2I[t2i.tsx<br/>短冊→画像変換]
        M[meta.tsx<br/>メタ情報]
        L2[Logo.tsx]
        Q[QrCode.tsx]
    end
    
    subgraph "src/components"
        CT[createTanzaku<br/>短冊コンポーネント]
        N[Navbar.tsx]
        FO[Footer.tsx]
    end
    
    subgraph "src/api"
        CL[client.ts<br/>API通信]
        GT[generated/types.ts<br/>OpenAPI型定義]
    end
    
    subgraph "src/lib"
        LO[login.ts<br/>認証状態管理]
    end

    P1 --> F
    P1 --> N
    P1 --> FO
    P2 --> T2I
    P2 --> M
    F --> PM
    F --> T
    F --> TD
    F --> CL
    T2I --> CL
    CL --> GT
    P4 --> LO
    P3 --> LO
    P3 --> CL

    style P1 fill:#e1f5ff
    style P2 fill:#e1f5ff
    style P3 fill:#ffe1f5
    style CL fill:#fff4e1
```

## バックエンド詳細構成

```mermaid
graph TB
    subgraph "Cloudflare Workers (tanzakuv2)"
        subgraph "Hono Framework"
            APP[Hono App<br/>メインアプリケーション]
        end
        
        subgraph "ルーティング"
            R1["/tanzaku<br/>GET: 一覧取得<br/>POST: 作成"]
            R2["/tanzaku/check/{id}<br/>GET: 詳細取得"]
            R3["/tanzaku/client<br/>GET: クライアント表示用（limit指定可）"]
            R4["/auth/signup<br/>POST: 新規登録"]
            R5["/auth/login<br/>POST: ログイン"]
            R6["/auth/refresh<br/>POST: トークン更新"]
            R7["/auth/google<br/>GET: Google OAuth"]
            R8["/manage/tanzakus<br/>GET: 全件取得<br/>POST: 編集/削除"]
        end
        
        subgraph "ミドルウェア"
            MW1[CORS]
            MW2[認証ミドルウェア<br/>JWT検証]
            MW3[バリデーション]
        end
        
        subgraph "ビジネスロジック"
            BL1[短冊サービス]
            BL2[認証サービス]
            BL3[管理者サービス]
        end
    end
    
    subgraph "データアクセス層"
        PR[Prisma Client]
        SC[スキーマ定義]
    end
    
    subgraph "データベース"
        D1[Cloudflare D1<br/>SQL Database]
        TB1[(tanzaku テーブル)]
        TB2[(users テーブル)]
    end
    
    subgraph "外部サービス"
        GO[Google OAuth API]
    end

    APP --> R1
    APP --> R2
    APP --> R3
    APP --> R4
    APP --> R5
    APP --> R6
    APP --> R7
    APP --> R8
    
    R1 --> MW1
    R2 --> MW1
    R3 --> MW1
    R4 --> MW1
    R5 --> MW1
    R6 --> MW1
    R7 --> MW1
    R8 --> MW1
    R8 --> MW2
    
    R1 --> MW3
    R2 --> MW3
    R3 --> MW3
    R4 --> MW3
    R5 --> MW3
    
    R1 --> BL1
    R2 --> BL1
    R3 --> BL1
    R4 --> BL2
    R5 --> BL2
    R6 --> BL2
    R7 --> BL2
    R8 --> BL3
    
    BL1 --> PR
    BL2 --> PR
    BL3 --> PR
    BL2 --> GO
    
    PR --> SC
    PR --> D1
    
    D1 --> TB1
    D1 --> TB2

    style APP fill:#fff4e1
    style D1 fill:#e1ffe1
    style GO fill:#ffe1f5
```

## データフロー図

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as フロントエンド<br/>(Next.js)
    participant API as API Client<br/>(openapi-fetch)
    participant B as バックエンド<br/>(Hono)
    participant P as Prisma
    participant D as D1 Database

    Note over U,D: 短冊投稿フロー
    U->>F: フォーム入力
    F->>F: バリデーション
    F->>API: POST /tanzaku
    API->>B: HTTP Request
    B->>B: バリデーション
    B->>P: createTanzaku()
    P->>D: INSERT INTO tanzaku
    D-->>P: 成功
    P-->>B: Tanzaku オブジェクト
    B-->>API: JSON Response
    API-->>F: レスポンスデータ
    F->>F: TwitterDialog表示
    F->>U: 投稿完了通知

    Note over U,D: 短冊表示フロー
    U->>F: /tree ページアクセス
    F->>API: GET /tanzaku/client
    API->>B: HTTP Request
    B->>P: getClientTanzaku(limit)
    P->>D: SELECT * FROM tanzaku LIMIT limit (default: 10, max: 30)
    D-->>P: データ配列
    P-->>B: Tanzaku[]
    B-->>API: JSON Response
    API-->>F: 短冊データ
    F->>F: 短冊を画像に描画
    F->>U: 短冊表示

    Note over U,D: 認証フロー
    U->>F: Google認証開始
    F->>B: GET /auth/google
    B->>GO: Google OAuth
    GO-->>B: 認証トークン
    B->>P: ユーザー検索/作成
    P->>D: SELECT/INSERT users
    D-->>P: ユーザー情報
    P-->>B: User オブジェクト
    B->>B: JWT生成
    B-->>F: アクセストークン
    F->>F: Jotaiに保存
    F->>U: 管理者画面へリダイレクト
```

## 技術スタック

### フロントエンド (tanzaku-frontend-v2)
- **フレームワーク**: Next.js 15.3.1 (App Router)
- **デプロイ**: Cloudflare Workers (OpenNext.js Cloudflare)
- **スタイリング**: Panda CSS 0.53.7
- **状態管理**: Jotai 2.12.5
- **フォーム**: React Hook Form 7.56.4
- **API通信**: openapi-fetch 0.14.0
- **型生成**: openapi-typescript 7.8.0
- **UIコンポーネント**: React Aria Components 1.9.0
- **アイコン**: Tabler Icons React 3.33.0
- **QRコード**: next-qrcode 2.5.1
- **分析**: Google Analytics (Next.js Third Parties)

### バックエンド (tanzakuv2)
- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono
- **ORM**: Prisma
- **データベース**: Cloudflare D1 (SQL)
- **認証**: JWT + Google OAuth
- **API仕様**: OpenAPI 3.0

### インフラ
- **ホスティング**: Cloudflare Workers
- **ドメイン**: tanzaku.mizphses.com (フロントエンド)
- **API**: tanzakuv2.fuminori.workers.dev (バックエンド)
- **CDN**: Cloudflare CDN
