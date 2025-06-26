import { CreateTanzaku } from "@/components/createTanzaku";
import { useEffect, useRef } from "react";
import { css } from "styled-system/css";

const spinAnimation = {
  animation: "spin 1s linear infinite",
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
} as const;

type PreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  message: string;
  isSubmitting: boolean;
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  name,
  message,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  // メッセージを2行に分割
  const [textLine1, textLine2] =
    message.length > 7
      ? [message.slice(0, 7), message.slice(7)]
      : [message, ""];

  // CreateTanzaku用のrefを用意
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // モーダルが開くたびにCanvasをリセット（keyで強制再生成）
  const tanzakuKey = name + textLine1 + textLine2 + isOpen;

  return (
    <div
      className={css({
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      })}
    >
      <div
        className={css({
          backgroundColor: "white",
          color: "#111",
          padding: "24px",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "400px",
        })}
      >
        <h2
          className={css({
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "16px",
          })}
        >
          投稿確認
        </h2>
        <div
          className={css({
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          })}
        >
          <div
            className={css({
              transformOrigin: "top center",
            })}
          >
            <CreateTanzaku
              key={tanzakuKey}
              ref={previewCanvasRef}
              textLine1={textLine1}
              textLine2={textLine2}
              nameLine={name}
            />
          </div>
          <div
            className={css({
              width: "100%",
            })}
          >
            <p className={css({ fontSize: "12px", color: "#666" })}>
              ※色は掲示時にランダムに決まります。
            </p>
            <p
              className={css({
                fontSize: "16px",
                marginBottom: "8px",
              })}
            >
              <strong>名前：</strong>
              {name}
            </p>
            <p
              className={css({
                fontSize: "16px",
              })}
            >
              <strong>メッセージ：</strong>
              {message}
            </p>
          </div>
        </div>
        <div
          className={css({
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          })}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={css({
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              _hover: {
                backgroundColor: isSubmitting ? "transparent" : "#f0f0f0",
              },
            })}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={css({
              padding: "8px 16px",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "4px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              _hover: {
                backgroundColor: isSubmitting ? "#000" : "#333",
              },
              display: "flex",
              alignItems: "center",
              gap: "8px",
            })}
          >
            {isSubmitting ? (
              <>
                <div
                  className={css({
                    width: "16px",
                    height: "16px",
                    border: "2px solid #fff",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  })}
                  style={{
                    animation: "spin 1s linear infinite",
                  }}
                />
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
