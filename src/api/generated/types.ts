/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/tanzaku": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * tanzaku一覧を取得
     * @description 全てのtanzakuの一覧を取得します
     */
    get: operations["getTanzakuList"];
    put?: never;
    /**
     * 新しいtanzakuを作成
     * @description 新しいtanzakuを作成します
     */
    post: operations["createTanzaku"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/tanzaku/{id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 特定のtanzakuを取得
     * @description 指定されたIDのtanzakuの詳細を取得します
     */
    get: operations["getTanzakuById"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/tanzaku/client": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 最新20件のtanzakuを取得
     * @description 最新の20件のtanzakuを取得します
     */
    get: operations["getRecentTanzaku"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/signup": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 新規ユーザー登録
     * @description 新しいユーザーを登録します
     */
    post: operations["signup"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/login": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * ログイン
     * @description 既存ユーザーとしてログインします
     */
    post: operations["login"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/refresh": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * トークンのリフレッシュ
     * @description アクセストークンをリフレッシュします
     */
    post: operations["refreshToken"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/admin/tanzakus": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 管理者用：全tanzakuの取得
     * @description 管理者権限で全てのtanzakuを取得します
     */
    get: operations["adminGetAllTanzaku"];
    put?: never;
    /**
     * 管理者用：tanzakuの編集
     * @description 管理者権限でtanzakuを編集または削除します
     */
    post: operations["adminEditTanzaku"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    Tanzaku: {
      id?: string;
      content?: string;
      userName?: string;
      /** @enum {number} */
      validationResult?: 0 | 1;
    };
    AuthTokens: {
      accessToken?: string;
      refreshToken?: string;
    };
    Error: {
      error?: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  getTanzakuList: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description tanzaku一覧 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Tanzaku"][];
        };
      };
    };
  };
  createTanzaku: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          /** @description 14文字以内のメッセージ */
          content: string;
          userName: string;
        };
      };
    };
    responses: {
      /** @description 作成されたtanzaku */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Tanzaku"];
        };
      };
    };
  };
  getTanzakuById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description tanzakuの詳細 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Tanzaku"];
        };
      };
      /** @description tanzakuが見つかりません */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
    };
  };
  getRecentTanzaku: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description tanzaku一覧 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Tanzaku"][];
        };
      };
    };
  };
  signup: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          /** Format: email */
          email: string;
          password: string;
        };
      };
    };
    responses: {
      /** @description 認証トークン */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthTokens"];
        };
      };
      /** @description エラー */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
    };
  };
  login: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          /** Format: email */
          email: string;
          password: string;
        };
      };
    };
    responses: {
      /** @description 認証トークン */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthTokens"];
        };
      };
      /** @description エラー */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
    };
  };
  refreshToken: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          refreshToken: string;
        };
      };
    };
    responses: {
      /** @description 新しい認証トークン */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AuthTokens"];
        };
      };
      /** @description 無効なリフレッシュトークン */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
    };
  };
  adminGetAllTanzaku: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description 全tanzaku一覧 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Tanzaku"][];
        };
      };
    };
  };
  adminEditTanzaku: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": (
          | {
              id: string;
              /** @enum {string} */
              operation: "delete";
            }
          | {
              id: string;
              /** @enum {string} */
              operation: "update";
              content: string;
              userName: string;
            }
        )[];
      };
    };
    responses: {
      /** @description 編集成功 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            success?: boolean;
          };
        };
      };
      /** @description エラー */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Error"];
        };
      };
    };
  };
}
