"use client";

import { getRecentTanzaku } from "@/api/client";
import { CreateTanzaku } from "@/components/createTanzaku";
import { festivalModeAtom } from "@/lib/festivalModeAtom";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";

type tanzakuType = {
  id: string;
  textLine1: string;
  textLine2?: string;
  userName: string;
};

const tanabataPositions = [
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

const sakuraPositions = [
  { x: "750px", y: "80px" },
  { x: "880px", y: "150px" },
  { x: "620px", y: "130px" },
  { x: "800px", y: "260px" },
  { x: "680px", y: "240px" },
  { x: "560px", y: "310px" },
  { x: "720px", y: "380px" },
  { x: "840px", y: "360px" },
  { x: "600px", y: "450px" },
  { x: "740px", y: "490px" },
];

export const TanzakuToImage: React.FC = () => {
  const mode = useAtomValue(festivalModeAtom);
  const isSakura = mode === "sakura";

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

    fetchTanzaku();
    const interval = setInterval(fetchTanzaku, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setImageLoaded(false);
    setImage(null);

    const bgImage = new Image();
    bgImage.src = isSakura ? "/sakura-tree.webp" : "/sasa.webp";
    bgImage.onload = () => {
      setImage(bgImage);
      setImageLoaded(true);
    };
    // sakura-tree.webp がない場合でも描画を続行する
    bgImage.onerror = () => {
      setImageLoaded(true);
    };
  }, [isSakura]);

  useEffect(() => {
    if (imageLoaded && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        if (image) {
          const width = image.width;
          const height = image.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(image, 0, 0, width, height);
        } else if (isSakura) {
          // sakura-tree.webp がない場合は桜色の背景で代替
          canvas.width = 1200;
          canvas.height = 1000;
          const gradient = ctx.createLinearGradient(0, 0, 0, 1000);
          gradient.addColorStop(0, "#fff0f5");
          gradient.addColorStop(1, "#fce4ec");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 1200, 1000);
        }
      }
    }
  }, [image, imageLoaded, isSakura]);

  const positionArray = isSakura ? sakuraPositions : tanabataPositions;

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
            mode={mode}
            textLine1={tanzaku.textLine1}
            textLine2={tanzaku.textLine2}
            nameLine={tanzaku.userName}
            style={{
              position: "absolute",
              ...(isSakura
                ? { width: "200px", height: "auto" }
                : { height: "220px", width: "auto" }),
              left: positionArray[positionIndex].x,
              top: positionArray[positionIndex].y,
            }}
          />
        );
      })}
    </>
  );
};
