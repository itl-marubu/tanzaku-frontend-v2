import { describe, expect, it } from "vitest";
import { createParticle, stepParticles } from "./particles";

const fixedRng = (value: number) => () => value;

describe("createParticle", () => {
  it("randomY=true なら画面内のY座標", () => {
    const p = createParticle(1000, 800, true, fixedRng(0.5));
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(800);
  });

  it("randomY=false なら画面上端より上から出現", () => {
    const p = createParticle(1000, 800, false, fixedRng(0.5));
    expect(p.y).toBeLessThan(0);
  });

  it("速度は常に右下方向（velocityX/Y > 0）", () => {
    for (const v of [0, 0.5, 0.999]) {
      const p = createParticle(1000, 800, true, fixedRng(v));
      expect(p.velocityX).toBeGreaterThan(0);
      expect(p.velocityY).toBeGreaterThan(0);
    }
  });
});

describe("stepParticles", () => {
  it("位置と回転が速度分だけ進む", () => {
    const p = createParticle(1000, 800, true, fixedRng(0.5));
    const before = { x: p.x, y: p.y, rotation: p.rotation };
    stepParticles([p], 1000, 800, fixedRng(0.5));
    expect(p.x).toBeCloseTo(before.x + p.velocityX);
    expect(p.y).toBeCloseTo(before.y + p.velocityY);
    expect(p.rotation).toBeCloseTo(before.rotation + p.rotationSpeed);
  });

  it("不透明度は上限・下限で反転する", () => {
    const p = createParticle(1000, 800, true, fixedRng(0.5));
    p.opacity = p.opacityMax;
    const speed = Math.abs(p.opacitySpeed) || 0.002;
    p.opacitySpeed = speed;
    stepParticles([p], 1000, 800, fixedRng(0.5));
    expect(p.opacitySpeed).toBeLessThan(0);
  });

  it("画面外に出たパーティクルは再生成される", () => {
    const p = createParticle(1000, 800, true, fixedRng(0.5));
    p.x = 2000; // 画面外
    const particles = [p];
    stepParticles(particles, 1000, 800, fixedRng(0.5));
    expect(particles[0]).not.toBe(p);
    expect(particles[0].y).toBeLessThan(0); // 上端から再出現
  });
});
