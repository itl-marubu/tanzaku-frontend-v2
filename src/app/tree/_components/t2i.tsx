"use client";

import { getRecentTanzaku } from "@/api/client";
import { CreateTanzaku } from "@/components/createTanzaku";
import { useEffect, useRef, useState } from "react";

type tanzakuType = {
  id: string;
  textLine1: string;
  textLine2?: string;
  userName: string;
};

export const TanzakuToImage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tanzakuArray, setTanzakuArray] = useState([] as tanzakuType[]);

  useEffect(() => {
    const fetchTanzaku = async () => {
      try {
        const tanzakuData = await getRecentTanzaku();
        if (!tanzakuData) {
          throw new Error("データの取得に失敗しました");
        }
        setTanzakuArray(tanzakuData as tanzakuType[]);
      } catch (error) {
        console.error("短冊データの取得に失敗しました:", error);
        alert("問題が発生しました。\n エラーコード: geterr2");
      }
    };

    // 初回実行
    fetchTanzaku();

    // 1分ごとに更新
    const interval = setInterval(fetchTanzaku, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const image = new Image();
    image.src = "/sasa.webp";

    image.onload = () => {
      setImage(image);
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (imageLoaded && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const width = image?.width;
        const height = image?.height;
        canvas.width = width as number;
        canvas.height = height as number;
        ctx.drawImage(
          image as HTMLImageElement,
          0,
          0,
          width as number,
          height as number,
        );
      }
    }
  }, [image, imageLoaded]);

  const positionArray = [
    { x: "900px", y: "80px" },
    { x: "1000px", y: "300px" },
    { x: "720px", y: "230px" },
    { x: "460px", y: "460px" },
    { x: "620px", y: "393px" },
    { x: "730px", y: "460px" },
    { x: "160px", y: "600px" },
    { x: "380px", y: "650px" },
    { x: "560px", y: "650px" },
    { x: "500px", y: "810px" },
  ];

  return (
    <>
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        style={{
          position: "absolute",
          width: "auto",
          height: "100vh",
        }}
      />
      {tanzakuArray.map((tanzaku, index) => {
        const positionIndex = index % positionArray.length;
        return (
          <CreateTanzaku
            key={tanzaku.id}
            textLine1={tanzaku.textLine1}
            textLine2={tanzaku.textLine2}
            nameLine={tanzaku.userName}
            style={{
              position: "absolute",
              height: "220px",
              width: "auto",
              left: positionArray[positionIndex].x,
              top: positionArray[positionIndex].y,
            }}
          />
        );
      })}
    </>
  );
};