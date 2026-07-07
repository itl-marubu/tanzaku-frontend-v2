import {
  MAX_DPR,
  PARTICLE_COUNT,
  type Particle,
  createParticle,
  stepParticles,
} from "@/lib/particles";
import { useEffect, useRef } from "react";

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
      stepParticles(particles, width, height);
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
      className="pointer-events-none fixed inset-0 z-2 h-full w-full"
    />
  );
};
