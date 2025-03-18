import { RefObject, useRef } from "react";
import { useCanvasStore } from "@/store/canvasStore";

export const useRectangle = (
  canvasRef: RefObject<HTMLCanvasElement>,
  ctxRef: RefObject<CanvasRenderingContext2D | null>
) => {
  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const rect = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const { addRectangle, strokeColor, strokeWidth } = useCanvasStore();

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !ctxRef.current) return;
    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    startPoint.current = { x: offsetX, y: offsetY };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current || !ctxRef.current || !startPoint.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const x = Math.min(startPoint.current.x, offsetX);
    const y = Math.min(startPoint.current.y, offsetY);
    const width = Math.abs(offsetX - startPoint.current.x);
    const height = Math.abs(offsetY - startPoint.current.y);
    rect.current = { x, y, width, height };
    drawRect();
  };

  const onMouseUp = () => {
    if (!isDrawing.current || !rect.current) return;
    isDrawing.current = false;
    addRectangle({ id: crypto.randomUUID(), ...rect.current, strokeColor, strokeWidth });
    rect.current = null;
  };

  const onMouseLeave = onMouseUp;

  const drawRect = () => {
    if (!ctxRef.current || !rect.current) return;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.strokeRect(rect.current.x, rect.current.y, rect.current.width, rect.current.height);
  };

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};
