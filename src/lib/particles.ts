// 桜の花びらパーティクルの生成・更新ロジック（旧 SakuraPetalParticles から
// 移植した純粋関数）。乱数生成器を注入してテスト可能にしている。

import type { Rng } from "./treeLayout";

export type Particle = {
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

export const PARTICLE_COUNT = 80;
export const MAX_DPR = 2;

export function createParticle(
  width: number,
  height: number,
  randomY = true,
  rng: Rng = Math.random,
): Particle {
  const size = 12 + rng() * 26;
  const baseOpacity = 0.1 + rng() * 0.3;

  return {
    x: rng() * width,
    y: randomY ? rng() * height : -size - rng() * height * 0.2,
    size,
    velocityX: 0.4 + rng() * 1.2,
    velocityY: 0.8 + rng() * 2.0,
    rotation: rng() * Math.PI * 2,
    rotationSpeed: (rng() - 0.5) * 0.02,
    opacity: baseOpacity,
    opacitySpeed: (rng() - 0.5) * 0.004,
    opacityMin: 0.05,
    opacityMax: 0.45,
  };
}

// 1フレーム分の更新。画面外へ出たパーティクルは上端から再生成する。
export function stepParticles(
  particles: Particle[],
  width: number,
  height: number,
  rng: Rng = Math.random,
): void {
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
      particles[i] = createParticle(width, height, false, rng);
    }
  }
}
