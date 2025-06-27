import type React from "react";
import { css } from "styled-system/css";

type TwitterDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  message: string;
  imageUrl?: string;
};

export const TwitterDialog: React.FC<TwitterDialogProps> = ({
  isOpen,
  onClose,
  name,
  message,
  imageUrl,
}) => {
  if (!isOpen) return null;

  // テンプレート文
  const tweetText = `#iTL七夕祭2025 に短冊を投稿しました！\nキャンパスロビーでご覧ください！\n@itl_marubu #iTL七夕祭\n\n「${message}」\n\nお名前：${name}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  // Web Share APIを使用して共有
  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: "iTL七夕祭2025 短冊投稿",
          text: tweetText,
        };

        // 画像がある場合はファイルとして追加
        if (imageUrl) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], "tanzaku.png", { type: "image/png" });
            shareData.files = [file];
          } catch (error) {
            console.error("画像の取得に失敗しました:", error);
          }
        }

        await navigator.share(shareData);
      } catch (error) {
        console.error("共有に失敗しました:", error);
      }
    } else {
      // Web Share APIがサポートされていない場合のフォールバック
      alert("お使いのブラウザでは共有機能がサポートされていません。");
    }
  };

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
          color: "#111",
          padding: "32px 24px 24px 24px",
          borderRadius: "10px",
          width: "90%",
          maxWidth: "400px",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          textAlign: "center",
        })}
      >
        <h2
          className={css({
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "16px",
          })}
        >
          ご参加ありがとうございます。
          <br />
          ぜひSNSでシェアしてください！
        </h2>

        {imageUrl && (
          <div
            className={css({
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            })}
          >
            <img
              src={imageUrl}
              alt="短冊画像"
              style={{
                width: 180,
                height: 300,
              }}
            />
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
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          })}
        >
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={css({
              display: "inline-block",
              background: "#000",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "5px",
              fontWeight: 700,
              textDecoration: "none",
              _hover: { background: "#333" },
            })}
          >
            Xで投稿する
          </a>
          <button
            type="button"
            onClick={handleWebShare}
            className={css({
              background: "#000",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "5px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              _hover: { background: "#333" },
            })}
          >
            他のアプリで共有
          </button>
        </div>
      </div>
    </div>
  );
};
