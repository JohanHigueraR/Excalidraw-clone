import { RefObject, useRef } from "react";
import getStroke from "perfect-freehand";
import {getSvgPathFromStroke} from '@/utils/getSvgPathFromStroke'
import { useCanvasStore } from "@/store/canvasStore";

export const useRectangle = (
  canvasRef: RefObject<HTMLCanvasElement>,
  ctxRef: RefObject<CanvasRenderingContext2D | null>
) => {
  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const rect = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const history = useRef<Path2D[]>([]); // Guarda los trazos anteriores
  
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
  
    useCanvasStore.getState().addElement({
      type: 'rectangle',
      data: rect.current,
    });
  
    rect.current = null;
  };

  const onMouseLeave = onMouseUp;

  const drawRect = () => {
    if (!ctxRef.current || !rect.current) return;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeRect(rect.current.x, rect.current.y, rect.current.width, rect.current.height);
  };

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};
