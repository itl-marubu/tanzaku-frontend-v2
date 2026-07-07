// CSV出力（旧 manage.ts の exportCSV を移植）。
// BOM付きUTF-8・日本語ヘッダー・tanzaku_data_YYYYMMDD_HHMM.csv を維持する。

import type { ManageTanzaku } from "@/api/adminClient";

const CSV_HEADERS = [
  "ID",
  "内容",
  "ユーザー名",
  "バリデーション結果",
  "表示パターン",
  "論理削除",
  "作成日時",
];

const escapeCsvField = (value: string) => `"${value.replace(/"/g, '""')}"`;

export function buildTanzakuCsv(list: ManageTanzaku[]): string {
  const rows = [
    CSV_HEADERS.join(","),
    ...list.map((tanzaku) =>
      [
        tanzaku.id,
        escapeCsvField(tanzaku.content),
        escapeCsvField(tanzaku.userName),
        tanzaku.validationResult === 0 ? "適切" : "不適切",
        tanzaku.visiblePattern ? "表示" : "非表示",
        tanzaku.logicalDelete ? "削除済み" : "有効",
        new Date(tanzaku.createdAt).toLocaleString("ja-JP"),
      ].join(","),
    ),
  ];
  // BOMを追加してExcelで文字化けを防ぐ
  return `\uFEFF${rows.join("\n")}`;
}

export function buildCsvFilename(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const dateString = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate(),
  )}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `tanzaku_data_${dateString}.csv`;
}

export function downloadTanzakuCsv(list: ManageTanzaku[]): void {
  const csv = buildTanzakuCsv(list);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", buildCsvFilename());
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
