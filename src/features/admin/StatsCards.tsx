import type { TanzakuStats } from "./tanzakuFilters";

const cards = [
  { key: "total", label: "総数" },
  { key: "valid", label: "適切" },
  { key: "invalid", label: "不適切" },
  { key: "deleted", label: "削除済み" },
] as const;

export const StatsCards: React.FC<{ stats: TanzakuStats }> = ({ stats }) => {
  return (
    <>
      <div className="mb-2 text-sm text-[#666]">{stats.scopeLabel}</div>
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {cards.map(({ key, label }) => (
          <div key={key} className="rounded-lg bg-white p-6 text-center shadow">
            <div className="text-3xl font-bold text-[#3498db]">
              {stats[key]}
            </div>
            <div className="mt-2 text-[#7f8c8d]">{label}</div>
          </div>
        ))}
      </div>
    </>
  );
};
