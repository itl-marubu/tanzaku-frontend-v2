import { updateFestivalMode } from "@/api/adminClient";
import { useFestivalMode } from "@/lib/activeMode";
import { useAdminAuth } from "@/lib/adminAuth";
import { type FestivalMode, MODE_CONFIG } from "@/lib/festivalMode";
import { useEffect, useState } from "react";

type FestivalModeSectionProps = {
  onSuccess: (text: string) => void;
  onError: (error: unknown, fallback: string) => void;
};

const modeOptions: { value: FestivalMode; label: string }[] = [
  { value: "tanabata", label: "七夕" },
  { value: "sakura", label: "桜" },
];

export const FestivalModeSection: React.FC<FestivalModeSectionProps> = ({
  onSuccess,
  onError,
}) => {
  const { credentials } = useAdminAuth();
  const { mode, refresh } = useFestivalMode();
  const [selected, setSelected] = useState<FestivalMode>(mode);
  const [isSaving, setIsSaving] = useState(false);

  // ポーリング等で現在モードが外部から変わった場合も選択肢を追従させる
  useEffect(() => {
    setSelected(mode);
  }, [mode]);

  const handleSave = async () => {
    if (!credentials) return;
    try {
      setIsSaving(true);
      await updateFestivalMode(credentials, selected);
      await refresh();
      onSuccess("表示モードを更新しました");
    } catch (error) {
      onError(error, "エラー: 表示モードの更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-base font-semibold">表示モード</h2>
      <p className="mb-4 text-sm text-[#7f8c8d]">
        現在のモード: {MODE_CONFIG[mode].eventName}（
        {mode === "sakura" ? "桜" : "七夕"}）
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as FestivalMode)}
          className="rounded border border-[#bdc3c7] bg-white p-2 text-sm"
        >
          {modeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`cursor-pointer rounded bg-[#3498db] px-4 py-2 text-sm text-white transition-all hover:opacity-80 ${
            isSaving ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
};
