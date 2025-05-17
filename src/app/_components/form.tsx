"use client";
import { createTanzaku } from "@/api/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import { PreviewModal } from "./PreviewModal";

type FormData = {
  name: string;
  message: string;
};

export const Form: React.FC = () => {
  const { register, handleSubmit, reset, watch } = useForm<FormData>();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<FormData | null>(null);

  const message = watch("message", "");
  const remainingChars = 14 - (message?.length || 0);
  const name = watch("name", "");
  const remainingNameChars = 8 - (name?.length || 0);

  const onSubmit = async (data: FormData) => {
    const res = await createTanzaku({
      content: data.message,
      userName: data.name,
    });
    console.log(res);
    reset();
    setIsPreviewOpen(false);
  };

  const handlePreview = (data: FormData) => {
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

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
            メッセージ
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
              名前
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
          className={css({
            background: "#000",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            _hover: {
              background: "#333",
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
        />
      )}
    </>
  );
};
