import { createTanzaku } from "@/api/client";
import { TanzakuCanvas } from "@/components/TanzakuCanvas";
import { ACTIVE_MODE } from "@/lib/activeMode";
import { MODE_CONFIG } from "@/lib/festivalMode";
import { sendGAEvent } from "@/lib/ga";
import {
  MAX_CONTENT_LENGTH,
  MAX_NAME_LENGTH,
  splitTanzakuText,
} from "@/lib/tanzakuText";
import { useCallback, useEffect, useRef, useState } from "react";
import { PreviewModal } from "./PreviewModal";
import { Toast } from "./Toast";
import { TwitterDialog } from "./TwitterDialog";

type FormData = {
  name: string;
  message: string;
};

export const Form: React.FC = () => {
  const mode = ACTIVE_MODE;
  const config = MODE_CONFIG[mode];
  const isSakura = mode === "sakura";

  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showTwitterDialog, setShowTwitterDialog] = useState(false);
  const [twitterDialogData, setTwitterDialogData] = useState<FormData | null>(
    null,
  );
  const [twitterImageUrl, setTwitterImageUrl] = useState<string | null>(null);
  const tanzakuCanvasRef = useRef<HTMLCanvasElement>(null);

  const remainingChars = MAX_CONTENT_LENGTH - message.length;
  const remainingNameChars = MAX_NAME_LENGTH - name.length;

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await createTanzaku({
        content: data.message,
        userName: data.name,
      });

      if (!res?.id) {
        console.error("Failed to create tanzaku:", res);
        setError(config.errorMessage);
        setIsPreviewOpen(false);
        sendGAEvent("event", "failed", {
          event_category: "result",
          event_label: "failed",
        });
        return;
      }

      setMessage("");
      setName("");
      setIsPreviewOpen(false);
      if (res.validationResult === 1) {
        console.error("Validation failed:", res);
        sendGAEvent("event", "validation_failed", {
          event_category: "result",
          event_label: "done_v1",
          value: res.validationResult,
        });
      } else {
        sendGAEvent("event", "submit_tanzaku_form", {
          event_category: "result",
          event_label: "done",
        });
      }
      setShowToast(true);
      // 新しい画像は描画完了コールバック(handleTanzakuDraw)で設定される。
      // 前回の画像が一瞬残らないようクリアしておく。
      setTwitterImageUrl(null);
      setTwitterDialogData(data);
      setShowTwitterDialog(true);
    } catch (error) {
      console.error(error);
      setError(config.errorMessage);
      setIsPreviewOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setPreviewData({ name, message });
    setIsPreviewOpen(true);
  };

  useEffect(() => {
    sendGAEvent("event", "view_tanzaku_form", {
      event_category: "result",
      event_label: "view",
    });
  }, []);

  // 隠しcanvasはフォント読み込み待ちで描画が遅延するため、描画完了
  // コールバック経由でキャプチャする（即時 toDataURL だと空白/古い画像になる）。
  const handleTanzakuDraw = useCallback(() => {
    const canvas = tanzakuCanvasRef.current;
    if (canvas) {
      setTwitterImageUrl(canvas.toDataURL("image/png"));
    }
  }, []);

  const dialogLines = splitTanzakuText(twitterDialogData?.message ?? "");

  return (
    <>
      <form
        onSubmit={handlePreview}
        className="flex flex-col items-center gap-2.5"
      >
        {error && (
          <div className="mb-2 w-full rounded bg-[#ffebee] px-4 py-2 text-center text-red-600">
            {error}
          </div>
        )}
        <div className="flex w-full flex-col">
          <label htmlFor="message" className="text-base font-bold">
            {config.formLabel}
          </label>
          <div className="relative">
            <input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_CONTENT_LENGTH}
              className="w-full border border-[#ccc] p-2"
            />
            <span
              className={`absolute top-1/2 right-2 -translate-y-1/2 text-xs ${
                remainingChars < 0 ? "text-red-600" : "text-[#666]"
              }`}
            >
              {remainingChars}
            </span>
          </div>
          <div className="relative flex w-full flex-col">
            <label htmlFor="name" className="text-base font-bold">
              お名前を教えてください。
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME_LENGTH}
              className="border border-[#ccc] p-2"
            />
            <span
              className={`absolute top-[70%] right-2 -translate-y-1/2 text-xs ${
                remainingNameChars < 0 ? "text-red-600" : "text-[#666]"
              }`}
            >
              {remainingNameChars}
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: isSakura ? "#ffb7c5" : "#fff",
            color: isSakura ? "#3a1a2e" : "#000",
            borderColor: isSakura ? "#ffb7c5" : "#000",
          }}
          className={`mt-2.5 rounded border px-4 py-2 ${
            isSubmitting ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          }`}
        >
          {config.submitButton}
        </button>
      </form>
      {previewData && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onConfirm={() => onSubmit(previewData)}
          name={previewData.name}
          message={previewData.message}
          isSubmitting={isSubmitting}
          mode={mode}
        />
      )}
      <Toast
        message={config.toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="absolute -top-[9999px] -left-[9999px] h-0 w-0 overflow-hidden">
        <TanzakuCanvas
          ref={tanzakuCanvasRef}
          mode={mode}
          textLine1={dialogLines.line1}
          textLine2={dialogLines.line2}
          nameLine={twitterDialogData?.name || ""}
          onDraw={handleTanzakuDraw}
        />
      </div>
      {showTwitterDialog && twitterDialogData && (
        <TwitterDialog
          isOpen={showTwitterDialog}
          onClose={() => setShowTwitterDialog(false)}
          name={twitterDialogData.name}
          message={twitterDialogData.message}
          imageUrl={twitterImageUrl || undefined}
          mode={mode}
        />
      )}
    </>
  );
};
