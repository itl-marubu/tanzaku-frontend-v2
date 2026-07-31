// テーブル下部のページネーションUI。
// 1ページに収まる件数の場合は何も描画しない。

import { getTotalPages } from "./tanzakuFilters";

const pageBtn =
  "cursor-pointer rounded border border-[#bdc3c7] px-3 py-1 text-sm transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50";
const currentPageBtn =
  "cursor-pointer rounded bg-[#3498db] px-3 py-1 text-sm text-white transition-all";

type PageItem = number | "ellipsis";

// 先頭・末尾・現在ページ周辺のみ表示し、間は "ellipsis" で省略する
function buildPageItems(current: number, totalPages: number): PageItem[] {
  const middle: number[] = [];
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(totalPages - 1, current + 1);
    p++
  ) {
    middle.push(p);
  }

  const items: PageItem[] = [1];
  if (middle.length > 0 && middle[0] > 2) {
    items.push("ellipsis");
  }
  items.push(...middle);
  if (middle.length > 0 && middle[middle.length - 1] < totalPages - 1) {
    items.push("ellipsis");
  }
  if (totalPages > 1) {
    items.push(totalPages);
  }
  return items;
}

type PaginationProps = {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = getTotalPages(totalItems, pageSize);
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pageItems = buildPageItems(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ecf0f1] p-4">
      <span className="text-sm text-[#7f8c8d]">
        {totalItems}件中 {start}-{end}件
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={pageBtn}
        >
          前へ
        </button>
        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: 省略記号は同一ページ内で位置が変わらないため
            <span key={`ellipsis-${index}`} className="px-1 text-[#7f8c8d]">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={item === page ? currentPageBtn : pageBtn}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={pageBtn}
        >
          次へ
        </button>
      </div>
    </div>
  );
};
