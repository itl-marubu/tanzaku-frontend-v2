"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  opacitySpeed: number;
  opacityMin: number;
  opacityMax: number;
};

const PARTICLE_COUNT = 80;
const MAX_DPR = 2;

function createParticle(
  width: number,
  height: number,
  randomY = true,
): Particle {
  const size = 12 + Math.random() * 26;
  const baseOpacity = 0.1 + Math.random() * 0.3;

  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -size - Math.random() * height * 0.2,
    size,
    velocityX: 0.4 + Math.random() * 1.2,
    velocityY: 0.8 + Math.random() * 2.0,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    opacity: baseOpacity,
    opacitySpeed: (Math.random() - 0.5) * 0.004,
    opacityMin: 0.05,
    opacityMax: 0.45,
  };
}

export const SakuraPetalParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const particles: Particle[] = [];
    const petalImage = new Image();
    let imageLoaded = false;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const update = () => {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.rotation += p.rotationSpeed;
        p.opacity += p.opacitySpeed;

        if (p.opacity <= p.opacityMin || p.opacity >= p.opacityMax) {
          p.opacitySpeed *= -1;
        }

        if (p.x - p.size > width || p.y - p.size > height) {
          particles[i] = createParticle(width, height, false);
        }
      }
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      if (!imageLoaded) return;

      for (const p of particles) {
        context.save();
        context.globalAlpha = p.opacity;
        context.translate(p.x, p.y);
        context.rotate(p.rotation);
        context.drawImage(petalImage, -p.size / 2, -p.size / 2, p.size, p.size);
        context.restore();
      }
    };

    const loop = () => {
      update();
      draw();
      animationId = window.requestAnimationFrame(loop);
    };

    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(width, height, true));
    }

    petalImage.src = "/hanabira.svg";
    petalImage.onload = () => {
      imageLoaded = true;
      loop();
    };

    const onResize = () => {
      resize();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  );
};
