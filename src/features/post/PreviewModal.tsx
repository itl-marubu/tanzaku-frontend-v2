import { TanzakuCanvas } from "@/components/TanzakuCanvas";
import type { FestivalMode } from "@/lib/festivalMode";
import { splitTanzakuText } from "@/lib/tanzakuText";

type PreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  message: string;
  isSubmitting: boolean;
  mode: FestivalMode;
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  name,
  message,
  isSubmitting,
  mode,
}) => {
  if (!isOpen) return null;

  const { line1: textLine1, line2: textLine2 } = splitTanzakuText(message);
  const tanzakuKey = name + textLine1 + textLine2 + isOpen + mode;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50">
      <div className="max-h-[85vh] w-[90%] max-w-[400px] overflow-y-auto rounded-[10px] bg-white p-6 text-[#111]">
        <h2 className="mb-4 text-xl font-bold">投稿確認</h2>
        <div className="mb-4 flex flex-col items-center gap-4">
          <div className="origin-top scale-80">
            <TanzakuCanvas
              key={tanzakuKey}
              mode={mode}
              textLine1={textLine1}
              textLine2={textLine2}
              nameLine={name}
            />
          </div>
          <div className="w-full">
            {mode !== "sakura" && (
              <p className="text-xs text-[#666]">
                ※色は掲示時にランダムに決まります。
              </p>
            )}
            <p className="mb-2 text-base">
              <strong>名前：</strong>
              {name}
            </p>
            <p className="text-base">
              <strong>メッセージ：</strong>
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`rounded border border-[#ccc] px-4 py-2 ${
              isSubmitting
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer hover:bg-[#f0f0f0]"
            }`}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex items-center gap-2 rounded bg-black px-4 py-2 text-white ${
              isSubmitting
                ? "cursor-not-allowed opacity-70"
                : "cursor-pointer hover:bg-[#333]"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                送信中...
              </>
            ) : (
              "送信する"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
