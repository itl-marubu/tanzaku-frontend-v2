// 短冊メッセージ（最大14文字）を7文字ずつ2行に分割する。
// 旧実装では client.ts / form.tsx / PreviewModal.tsx に同じ処理が
// 3重複していたため一本化した。

export type TanzakuLines = {
  line1: string;
  line2: string;
};

export const MAX_CONTENT_LENGTH = 14;
export const MAX_NAME_LENGTH = 8;
export const LINE_LENGTH = 7;

export function splitTanzakuText(content: string): TanzakuLines {
  return {
    line1: content.slice(0, LINE_LENGTH),
    line2: content.slice(LINE_LENGTH),
  };
}
