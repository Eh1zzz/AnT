import React, { useEffect, useRef } from 'react';

interface DitherImageProps {
  src: string;
  width: number;
  height: number;
  threshold?: number;
}

export const DitherImage: React.FC<DitherImageProps> = ({ src, width, height, threshold = 128 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Floyd-Steinberg Dithering Algorithm
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const oldPixel = data[idx]; // Grayscale value assumed
          const newPixel = oldPixel < threshold ? 0 : 255;
          const error = oldPixel - newPixel;

          data[idx] = newPixel;
          data[idx + 1] = newPixel;
          data[idx + 2] = newPixel;

          // Distribute error to neighboring pixels
          if (x + 1 < width) data[idx + 4] += (error * 7) / 16;
          if (y + 1 < height) {
            if (x > 0) data[idx + (width - 1) * 4] += (error * 3) / 16;
            data[idx + width * 4] += (error * 5) / 16;
            if (x + 1 < width) data[idx + (width + 1) * 4] += (error * 1) / 16;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };
  }, [src, width, height, threshold]);

  return <canvas ref={canvasRef} className="border border-black aspect-square w-full h-auto" />;
};