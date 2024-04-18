'use client';
import React, { useEffect, useState, useRef, useCallback, MouseEvent } from 'react';

import { PIXEL_SIZE, CANVAS_SIZE } from '@/const/canvas';

interface Behavior {
  x: number;
  y: number;
  beforeColorCode: string;
}

/** Layer Component */
export default function DrawingLayer({
  selectedColor,
  availableClickRatio,
}: {
  selectedColor: string;
  availableClickRatio: number;
}) {
  /** canvas */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const context = canvasRef.current?.getContext('2d', { willReadFrequently: true });
  const rect = canvasRef.current?.getBoundingClientRect();

  /** TODO: 나중에 픽셀 단위가 아니라 행동 단위로 저장 및 undo필요 */
  const [behaivior, setBehaivior] = useState<Behavior[]>([]);
  /** pen on / off */
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const handleCanvasPenOn = () => {
    setIsDrawing(true);
  };

  const handleCanvasPenOff = () => {
    setIsDrawing(false);
  };

  const handleCanvasDrawing = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !rect) return;

    context.fillStyle = selectedColor;
    const { isDrawed, pixelX, pixelY, hexColor } = fillPixel(
      context,
      PIXEL_SIZE,
      availableClickRatio,
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    isDrawed && stackDrawLog(pixelX, pixelY, hexColor, behaivior, setBehaivior);
  };

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!context || !rect) return;

    context.fillStyle = selectedColor;
    const { isDrawed, pixelX, pixelY, hexColor } = fillPixel(
      context,
      PIXEL_SIZE,
      availableClickRatio,
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    isDrawed && stackDrawLog(pixelX, pixelY, hexColor, behaivior, setBehaivior);
  };

  const handleUndo = useCallback(() => {
    if (!context) return;

    const behaiviorList = [...behaivior];
    const undoPixel = behaiviorList.pop();
    if (undoPixel && undoPixel.beforeColorCode) {
      context.fillStyle = undoPixel.beforeColorCode;
      context.fillRect(undoPixel.x, undoPixel.y, PIXEL_SIZE, PIXEL_SIZE);
      setBehaivior(behaiviorList);
    } else if (undoPixel && !undoPixel.beforeColorCode) {
      context.clearRect(undoPixel.x, undoPixel.y, PIXEL_SIZE, PIXEL_SIZE);
      setBehaivior(behaiviorList);
    }
  }, [behaivior, context]);

  useEffect(() => {
    const ctrlZ = function (event: KeyboardEvent) {
      if (event.ctrlKey && event.key === 'z') {
        handleUndo();
      }
    };

    addEventListener('keydown', ctrlZ);
    return () => removeEventListener('keydown', ctrlZ);
  }, [handleUndo]);

  return (
    <div className="relative flex place-items-center">
      <div
        className={`absolute top-0 left-0 w-${PIXEL_SIZE * CANVAS_SIZE} h-${
          PIXEL_SIZE * CANVAS_SIZE
        } checkered-bg z-10`}
      ></div>
      <canvas
        ref={canvasRef}
        className="bg-transparent outline-dotted z-20"
        width={PIXEL_SIZE * CANVAS_SIZE}
        height={PIXEL_SIZE * CANVAS_SIZE}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasPenOn}
        onMouseUp={handleCanvasPenOff}
        onMouseLeave={handleCanvasPenOff}
        onMouseMove={handleCanvasDrawing}
      ></canvas>
      <button
        type="button"
        className={`border ml-2 ${behaivior.length < 1 ? 'text-slate-300' : 'text-black'}`}
        disabled={behaivior.length < 1}
        onClick={handleUndo}
      >
        Undo
      </button>
    </div>
  );
}

/** pixel painting */
const fillPixel = (
  ctx: CanvasRenderingContext2D,
  pixelScale: number,
  availableClickRatio: number,
  x: number,
  y: number
) => {
  const pixelX = Math.floor(x / pixelScale) * pixelScale;
  const pixelY = Math.floor(y / pixelScale) * pixelScale;
  // TODO: 지우개 기능 추가 필요

  if (
    x - pixelX < pixelScale * availableClickRatio ||
    y - pixelY < pixelScale * availableClickRatio
  )
    return { isDrawed: false, pixelX, pixelY, hexColor: '' };

  const pixelData = ctx.getImageData(x, y, 1, 1).data;
  const hexColor = pixelData[3] === 0 ? '' : rgbToHex(pixelData[0], pixelData[1], pixelData[2]);

  ctx.fillRect(pixelX, pixelY, pixelScale, pixelScale);
  return { isDrawed: true, pixelX, pixelY, hexColor };
};

/** get RGB color hexcode */
const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/** stack log */
const stackDrawLog = (
  pixelX: number,
  pixelY: number,
  hexColor: string,
  recentPixel: Behavior[],
  setLog: React.Dispatch<React.SetStateAction<Behavior[]>>
) => {
  if (recentPixel.length < 1) {
    setLog([{ x: pixelX, y: pixelY, beforeColorCode: hexColor }]);
    return;
  }
  if (
    recentPixel[recentPixel.length - 1].x === pixelX &&
    recentPixel[recentPixel.length - 1].y === pixelY
  ) {
    return;
  }
  setLog((prevItems) => [...prevItems, { x: pixelX, y: pixelY, beforeColorCode: hexColor }]);
};
