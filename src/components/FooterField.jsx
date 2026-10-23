import { useEffect, useRef } from 'react';
import { drawFooterField } from './footerFieldDraw';

/**
 * The moving background of the contact footer: a halftone field with a few linked nodes and
 * pulses, a quiet picture of agents passing work between each other. Decorative only. It stands
 * still when the visitor asks for reduced motion and pauses while off screen.
 */
export default function FooterField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.('2d');
    if (!canvas || !ctx) return undefined;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let visible = true;
    let w = 0;
    let h = 0;

    // Sizes the canvas to its footer at the screen's pixel density, capped at 2.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFooterField(ctx, w, h, 12);
    };

    // Draws the next frame while the footer is on screen.
    const tick = (ms) => {
      if (visible) drawFooterField(ctx, w, h, ms / 1000);
      frame = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    let observer;
    if (!still) {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      observer.observe(canvas);
      frame = requestAnimationFrame(tick);
    }
    return () => {
      window.removeEventListener('resize', resize);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
