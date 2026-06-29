"use client";
import { useQRCode } from "next-qrcode";

type qrcodeType = {
  url: string;
};

export const QrCode: React.FC<qrcodeType> = ({ url }) => {
  const { Canvas } = useQRCode();

  return (
    <Canvas
      text={url}
      options={{
        errorCorrectionLevel: "M",
        margin: 3,
        scale: 4,
        width: 200,
        color: {
          dark: "#000",
          light: "#fff",
        },
      }}
    />
  );
};
