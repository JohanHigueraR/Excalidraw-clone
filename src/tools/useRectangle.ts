import { RefObject, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

export const useRectangle = (
  interactionCanvasRef: RefObject<HTMLCanvasElement>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>
) => {
  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const rect = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactionCanvasRef.current || !interactionCtxRef.current) return;
    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    startPoint.current = { x: offsetX, y: offsetY };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !interactionCanvasRef.current || !interactionCtxRef.current || !startPoint.current) return;
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

    // Guardar el rectángulo en el estado global
    useCanvasStore.getState().addElement({
      type: 'rectangle',
      data: rect.current,
      points: rect.current
    });

    rect.current = null;
  };

  const onMouseLeave = onMouseUp;

  const drawRect = () => {
    if (!interactionCtxRef.current || !rect.current) return;
    const ctx = interactionCtxRef.current;

    // Limpiar solo el canvas de interacción
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Dibujar el rectángulo temporal
    ctx.strokeRect(rect.current.x, rect.current.y, rect.current.width, rect.current.height);
  };

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};