export type FestivalMode = "tanabata" | "sakura";

export const DEFAULT_MODE: FestivalMode = "tanabata";

const envMode = process.env.NEXT_PUBLIC_FESTIVAL_MODE as
  | FestivalMode
  | undefined;
export const ACTIVE_MODE: FestivalMode =
  envMode === "tanabata" || envMode === "sakura" ? envMode : DEFAULT_MODE;

export const MODE_CONFIG = {
  tanabata: {
    eventName: "iTL七夕祭",
    itemName: "短冊",
    heading: "iTL七夕祭に、あなたの短冊を飾りましょう。",
    formLabel: "短冊にかけるメッセージを教えてください。",
    submitButton: "短冊をかける",
    toastMessage: "短冊が投稿されました！",
    errorMessage: "短冊の送信に失敗しました。もう一度お試しください。",
    shareTitle: "iTL七夕祭 短冊投稿",
    shareText: (message: string, name: string) =>
      `#iTL七夕祭2025 に短冊を投稿しました！\nキャンパスロビーでご覧ください！\n@itl_marubu #iTL七夕祭\n\n「${message}」\n\nお名前：${name}`,
  },
  sakura: {
    eventName: "iTL桜まつり",
    itemName: "抱負",
    heading: "iTL桜まつりに、あなたの抱負を掲げましょう。",
    formLabel: "新年度の抱負を教えてください。",
    submitButton: "抱負を掲げる",
    toastMessage: "抱負が投稿されました！",
    errorMessage: "抱負の投稿に失敗しました。もう一度お試しください。",
    shareTitle: "iTL桜まつり 抱負投稿",
    shareText: (message: string, name: string) =>
      `#iTL桜まつり2026 に抱負を投稿しました！\nキャンパスロビーでご覧ください！\n@itl_marubu #iTL桜まつり\n\n「${message}」\n\nお名前：${name}`,
  },
} as const;
