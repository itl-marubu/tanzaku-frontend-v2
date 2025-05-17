import { CreateTanzaku } from "@/components/createTanzaku";
import { css } from "styled-system/css";

type PreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  message: string;
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  name,
  message,
}) => {
  if (!isOpen) return null;

  // メッセージを2行に分割
  const [textLine1, textLine2] =
    message.length > 7
      ? [message.slice(0, 7), message.slice(7)]
      : [message, ""];

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
          padding: "24px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
        })}
      >
        <h2
          className={css({
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "16px",
          })}
        >
          プレビュー
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
              transform: "scale(0.6)",
              transformOrigin: "top center",
            })}
          >
            <CreateTanzaku
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
            className={css({
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              _hover: {
                backgroundColor: "#f0f0f0",
              },
            })}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={css({
              padding: "8px 16px",
              backgroundColor: "#000",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              _hover: {
                backgroundColor: "#333",
              },
            })}
          >
            送信する
          </button>
        </div>
      </div>
    </div>
  );
};
