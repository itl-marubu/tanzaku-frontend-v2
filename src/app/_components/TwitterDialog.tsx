import React from "react";
import { css } from "styled-system/css";

type TwitterDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  message: string;
  imageUrl?: string;
};

export const TwitterDialog: React.FC<TwitterDialogProps> = ({ isOpen, onClose, name, message, imageUrl }) => {
  if (!isOpen) return null;

  // テンプレート文
  const tweetText = `#iTL七夕祭2025 に短冊を投稿しました！\nキャンパスロビーでご覧ください！\n@itl_marubu #iTL七夕祭\n\n「${message}」\n\nお名前：${name}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

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
        zIndex: 2000,
      })}
    >
      <div
        className={css({
          backgroundColor: "white",
          padding: "32px 24px 24px 24px",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "400px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          textAlign: "center",
        })}
      >
        <h2 className={css({ fontSize: "20px", fontWeight: 700, marginBottom: "16px" })}>
          Twitterでシェアしませんか？
        </h2>
        <div className={css({ marginBottom: "16px", whiteSpace: "pre-line", fontSize: "15px", textAlign: "left" })}>
          {tweetText}
        </div>
        {imageUrl && (
          <div className={css({ marginBottom: "12px" })}>
            <img src={imageUrl} alt="短冊画像" style={{ width: 180, height: 300, borderRadius: 8, border: "1px solid #ccc" }} />
            <br />
            <a
              href={imageUrl}
              download="tanzaku.png"
              className={css({
                display: "inline-block",
                marginTop: "6px",
                fontSize: "13px",
                color: "#1da1f2",
                textDecoration: "underline",
                cursor: "pointer",
              })}
            >
              画像をダウンロード
            </a>
          </div>
        )}
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={css({
            display: "inline-block",
            background: "#1da1f2",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
            fontWeight: 700,
            textDecoration: "none",
            marginBottom: "12px",
            _hover: { background: "#0d8ddb" },
          })}
        >
          Twitterで投稿する
        </a>
        <br />
        <button
          onClick={onClose}
          className={css({
            marginTop: "8px",
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#fff",
            color: "#333",
            cursor: "pointer",
            fontWeight: 500,
            _hover: { background: "#f0f0f0" },
          })}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}; 