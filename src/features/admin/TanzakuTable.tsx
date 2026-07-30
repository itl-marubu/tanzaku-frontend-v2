import type { ManageTanzaku } from "@/api/adminClient";
import type { SortColumn, SortDirection } from "./tanzakuFilters";

const sortableColumns: { key: SortColumn; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "content", label: "内容" },
  { key: "userName", label: "ユーザー名" },
  { key: "validationResult", label: "バリデーション" },
];

const thClass = "bg-[#34495e] p-4 text-left font-semibold text-white";

const SortButton: React.FC<{
  label: string;
  icon: string;
  onClick: () => void;
}> = ({ label, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer font-semibold text-white select-none hover:opacity-80"
  >
    {label} <span className="text-xs opacity-70">{icon}</span>
  </button>
);

function statusBadge(tanzaku: ManageTanzaku) {
  if (tanzaku.logicalDelete) {
    return (
      <span className="rounded-xl bg-[#d1ecf1] px-2 py-1 text-xs font-semibold text-[#0c5460]">
        削除済み
      </span>
    );
  }
  return (
    <span className="rounded-xl bg-[#d4edda] px-2 py-1 text-xs font-semibold text-[#155724]">
      有効
    </span>
  );
}

function validationBadge(tanzaku: ManageTanzaku) {
  return tanzaku.validationResult === 0 ? (
    <span className="rounded-xl bg-[#d4edda] px-2 py-1 text-xs font-semibold text-[#155724]">
      適切
    </span>
  ) : (
    <span className="rounded-xl bg-[#f8d7da] px-2 py-1 text-xs font-semibold text-[#721c24]">
      不適切
    </span>
  );
}

type TanzakuTableProps = {
  tanzakus: ManageTanzaku[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSortBy: (column: SortColumn) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  renderActions?: (tanzaku: ManageTanzaku) => React.ReactNode;
};

export const TanzakuTable: React.FC<TanzakuTableProps> = ({
  tanzakus,
  sortColumn,
  sortDirection,
  onSortBy,
  selectedIds,
  onToggleSelect,
  renderActions,
}) => {
  const sortIcon = (column: SortColumn) =>
    column === sortColumn ? (sortDirection === "asc" ? "▲" : "▼") : "";

  const columnCount = 7 + (onToggleSelect ? 1 : 0) + (renderActions ? 1 : 0);

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {onToggleSelect && <th className={thClass}>選択</th>}
          {sortableColumns.map(({ key, label }) => (
            <th key={key} className={thClass}>
              <SortButton
                label={label}
                icon={sortIcon(key)}
                onClick={() => onSortBy(key)}
              />
            </th>
          ))}
          <th className={thClass}>状態</th>
          <th className={thClass}>
            <SortButton
              label="イベント"
              icon={sortIcon("event")}
              onClick={() => onSortBy("event")}
            />
          </th>
          <th className={thClass}>
            <SortButton
              label="作成日時"
              icon={sortIcon("createdAt")}
              onClick={() => onSortBy("createdAt")}
            />
          </th>
          {renderActions && <th className={thClass}>操作</th>}
        </tr>
      </thead>
      <tbody>
        {tanzakus.length === 0 ? (
          <tr>
            <td
              colSpan={columnCount}
              className="p-8 text-center text-[#7f8c8d]"
            >
              データがありません
            </td>
          </tr>
        ) : (
          tanzakus.map((tanzaku) => (
            <tr
              key={tanzaku.id}
              className="border-b border-[#ecf0f1] hover:bg-[#f8f9fa]"
            >
              {onToggleSelect && (
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds?.has(tanzaku.id) ?? false}
                    onChange={() => onToggleSelect(tanzaku.id)}
                  />
                </td>
              )}
              <td className="p-4">{tanzaku.id.substring(0, 8)}...</td>
              <td className="p-4">{tanzaku.content}</td>
              <td className="p-4">{tanzaku.userName}</td>
              <td className="p-4">{validationBadge(tanzaku)}</td>
              <td className="p-4">{statusBadge(tanzaku)}</td>
              <td className="p-4">
                {tanzaku.event ? (
                  tanzaku.event.name
                ) : (
                  <span className="text-[#aaa]">-</span>
                )}
              </td>
              <td className="p-4">
                {new Date(tanzaku.createdAt).toLocaleString("ja-JP")}
              </td>
              {renderActions && (
                <td className="p-4">{renderActions(tanzaku)}</td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
