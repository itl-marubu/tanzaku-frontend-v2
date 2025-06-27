"use client";
import { createTanzaku } from "@/api/client";
import { CreateTanzaku } from "@/components/createTanzaku";
import { sendGAEvent } from "@next/third-parties/google";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import { PreviewModal } from "./PreviewModal";
import { Toast } from "./Toast";
import { TwitterDialog } from "./TwitterDialog";

const spin = {
  animation: "spin 1s linear infinite",
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
};

type FormData = {
  name: string;
  message: string;
};

export const Form: React.FC = () => {
  const { register, handleSubmit, reset, watch } = useForm<FormData>();
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

  const message = watch("message", "");
  const remainingChars = 14 - (message?.length || 0);
  const name = watch("name", "");
  const remainingNameChars = 8 - (name?.length || 0);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await createTanzaku({
        content: data.message,
        userName: data.name,
      });
      console.log(res);

      if (!res?.id) {
        console.error("Failed to create tanzaku:", res);
        setError("短冊の送信に失敗しました。もう一度お試しください。");
        setIsPreviewOpen(false);
        sendGAEvent("event", "failed", {
          event_category: "result",
          event_label: "failed",
        });
        return;
      }

      reset();
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
      setTwitterDialogData(data);
      setShowTwitterDialog(true);
    } catch (error) {
      console.error(error);
      setError("短冊の送信に失敗しました。もう一度お試しください。");
      setIsPreviewOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = (data: FormData) => {
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  useEffect(() => {
    sendGAEvent("event", "view_tanzaku_form", {
      event_category: "result",
      event_label: "view",
    });
  }, []);

  useEffect(() => {
    if (showTwitterDialog && tanzakuCanvasRef.current && twitterDialogData) {
      const url = tanzakuCanvasRef.current.toDataURL("image/png");
      setTwitterImageUrl(url);
    }
  }, [showTwitterDialog, twitterDialogData]);

  return (
    <>
      <form
        onSubmit={handleSubmit(handlePreview)}
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
        })}
      >
        {error && (
          <div
            className={css({
              color: "red",
              backgroundColor: "#ffebee",
              padding: "8px 16px",
              borderRadius: "4px",
              width: "100%",
              textAlign: "center",
              marginBottom: "8px",
            })}
          >
            {error}
          </div>
        )}
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            width: "100%",
          })}
        >
          <label
            htmlFor="message"
            className={css({ fontSize: "16px", fontWeight: "bold" })}
          >
            短冊にかけるメッセージを教えてください。
          </label>
          <div
            className={css({
              position: "relative",
            })}
          >
            <input
              {...register("message", {
                maxLength: 14,
              })}
              maxLength={14}
              className={css({
                border: "1px solid #ccc",
                padding: "8px",
                width: "100%",
              })}
            />
            <span
              className={css({
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: remainingChars < 0 ? "red" : "#666",
              })}
            >
              {remainingChars}
            </span>
          </div>
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              width: "100%",
              position: "relative",
            })}
          >
            <label
              htmlFor="name"
              className={css({ fontSize: "16px", fontWeight: "bold" })}
            >
              お名前を教えてください。
            </label>
            <input
              {...register("name", { maxLength: 8 })}
              maxLength={8}
              className={css({ border: "1px solid #ccc", padding: "8px" })}
            />
            <span
              className={css({
                position: "absolute",
                right: "8px",
                top: "70%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: remainingNameChars < 0 ? "red" : "#666",
              })}
            >
              {remainingNameChars}
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={css({
            background: "#fff",
            color: "#000",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            border: "1px solid #000",
            _hover: {
              background: isSubmitting ? "#fff" : "#f0f0f0",
            },
            marginTop: "10px",
          })}
        >
          短冊をかける
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
        />
      )}
      <Toast
        message="短冊が投稿されました！"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div
        style={{
          position: "absolute",
          left: -9999,
          top: -9999,
          width: 0,
          height: 0,
          overflow: "hidden",
        }}
      >
        <CreateTanzaku
          ref={tanzakuCanvasRef}
          textLine1={twitterDialogData?.message?.slice(0, 7) || ""}
          textLine2={twitterDialogData?.message?.slice(7) || ""}
          nameLine={twitterDialogData?.name || ""}
        />
      </div>
      {showTwitterDialog && twitterDialogData && (
        <TwitterDialog
          isOpen={showTwitterDialog}
          onClose={() => setShowTwitterDialog(false)}
          name={twitterDialogData.name}
          message={twitterDialogData.message}
          imageUrl={twitterImageUrl || undefined}
        />
      )}
    </>
  );
};
