import QRCode from "qrcode";
import { useEffect, useRef } from "react";

type QrCodeProps = {
  url: string;
};

// next-qrcode の Canvas と同じオプションで qrcode パッケージへ置き換え
export const QrCode: React.FC<QrCodeProps> = ({ url }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, url, {
      errorCorrectionLevel: "M",
      margin: 3,
      scale: 4,
      width: 200,
      color: {
        dark: "#000",
        light: "#fff",
      },
    }).catch((error) => {
      console.error("QRコードの描画に失敗しました:", error);
    });
  }, [url]);

  return <canvas ref={canvasRef} />;
};
