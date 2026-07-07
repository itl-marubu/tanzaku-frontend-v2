import type { FestivalMode } from "@/lib/festivalMode";
import { MODE_CONFIG } from "@/lib/festivalMode";
import type React from "react";

type TwitterDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  message: string;
  imageUrl?: string;
  mode: FestivalMode;
};

export const TwitterDialog: React.FC<TwitterDialogProps> = ({
  isOpen,
  onClose,
  name,
  message,
  imageUrl,
  mode,
}) => {
  if (!isOpen) return null;

  const config = MODE_CONFIG[mode];
  const isSakura = mode === "sakura";

  const tweetText = config.shareText(message, name);
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        const shareData: ShareData = {
          title: config.shareTitle,
          text: tweetText,
        };

        if (imageUrl) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const fileName = isSakura ? "kokorozashi.png" : "tanzaku.png";
            const file = new File([blob], fileName, { type: "image/png" });
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
      alert("お使いのブラウザでは共有機能がサポートされていません。");
    }
  };

  // 桜モードは横型 (500×300)、七夕は縦型 (300×500) → ダイアログ内表示サイズ
  const imgStyle = isSakura
    ? { width: 250, height: 150 }
    : { width: 180, height: 300 };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black/50">
      <div className="max-h-[85vh] w-[90%] max-w-[400px] overflow-y-auto rounded-[10px] bg-white px-6 pt-8 pb-6 text-center text-[#111] shadow-md">
        <h2 className="mb-4 text-xl font-bold">
          ご参加ありがとうございます。
          <br />
          ぜひSNSでシェアしてください！
        </h2>

        {imageUrl && (
          <div className="mb-3 flex flex-col items-center">
            <img
              src={imageUrl}
              alt={`${config.itemName}画像`}
              style={imgStyle}
            />
            <br />
            <a
              href={imageUrl}
              download={isSakura ? "kokorozashi.png" : "tanzaku.png"}
              className="mt-1.5 inline-block cursor-pointer text-[13px] text-[#1da1f2] underline"
            >
              画像をダウンロード
            </a>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-[5px] bg-black px-5 py-2.5 font-bold text-white no-underline hover:bg-[#333]"
          >
            Xで投稿する
          </a>
          <button
            type="button"
            onClick={handleWebShare}
            className="cursor-pointer rounded-[5px] border-none bg-black px-5 py-2.5 font-bold text-white hover:bg-[#333]"
          >
            他のアプリで共有
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-none bg-transparent p-2 text-sm text-[#666]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
