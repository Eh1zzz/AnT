import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  src: string;
  alt?: string;
  className?: string;
  /** 0–255; lower = more black pixels. Default 128 */
  threshold?: number;
  /** Re-dither on hover with a higher threshold for a "blown-out" effect */
  hoverEffect?: boolean;
}

function ditherCanvas(
  ctx:   CanvasRenderingContext2D,
  w:     number,
  h:     number,
  thresh: number
) {
  const img  = ctx.getImageData(0, 0, w, h);
  const data = img.data;

  // Pre-pass: convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = g;
  }

  // Floyd-Steinberg dithering
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const old = data[idx];
      const nw  = old < thresh ? 0 : 255;
      const err = old - nw;
      data[idx] = data[idx + 1] = data[idx + 2] = nw;
      if (x + 1 < w)           { const k = idx + 4;             data[k] = data[k+1] = data[k+2] = Math.min(255, Math.max(0, data[k] + (err * 7) / 16)); }
      if (y + 1 < h && x > 0)  { const k = idx + (w - 1) * 4;  data[k] = data[k+1] = data[k+2] = Math.min(255, Math.max(0, data[k] + (err * 3) / 16)); }
      if (y + 1 < h)            { const k = idx + w * 4;         data[k] = data[k+1] = data[k+2] = Math.min(255, Math.max(0, data[k] + (err * 5) / 16)); }
      if (y + 1 < h && x + 1 < w) { const k = idx + (w + 1) * 4; data[k] = data[k+1] = data[k+2] = Math.min(255, Math.max(0, data[k] + (err * 1) / 16)); }
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function DitherImage({ src, alt = '', className = '', threshold = 128, hoverEffect = true }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const imgRef     = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    imgRef.current = img;
    img.onload = () => {
      render(threshold);
      setReady(true);
    };
    img.onerror = () => setReady(true);
  }, [src]);

  useEffect(() => {
    if (!ready || !imgRef.current) return;
    render(hoverEffect && hovered ? Math.min(threshold + 48, 255) : threshold);
  }, [hovered, threshold]);

  function render(thresh: number) {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.offsetWidth  || 400;
    const H = canvas.offsetHeight || 500;
    canvas.width = W; canvas.height = H;
    ctx.drawImage(img, 0, 0, W, H);
    ditherCanvas(ctx, W, H, thresh);
  }

  return (
    <motion.div
      className={`dither-wrap ${className}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      {!ready && <div className="absolute inset-0 bg-zinc-900 animate-pulse" />}
      <canvas ref={canvasRef} aria-label={alt} className="w-full h-full" />
    </motion.div>
  );
}
