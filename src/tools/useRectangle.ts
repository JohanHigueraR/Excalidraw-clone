import { RefObject, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

export const useRectangle = (
  interactionCanvasRef: RefObject<HTMLCanvasElement>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>,
  screenToCanvas: (point: { x: number; y: number }) => { x: number; y: number },
  canvasToScreen: (point: { x: number; y: number }) => { x: number; y: number }
) => {
  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const rect = useRef<{ 
    canvasRect: { x: number; y: number; width: number; height: number } | null,
    screenRect: { x: number; y: number; width: number; height: number } | null
  }>({ canvasRect: null, screenRect: null });

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactionCanvasRef.current || !interactionCtxRef.current) return;
    
    isDrawing.current = true;
    const canvasPoint = screenToCanvas({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    });
    startPoint.current = { x: canvasPoint.x, y: canvasPoint.y };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !interactionCanvasRef.current || !interactionCtxRef.current || !startPoint.current) return;
    
    // Coordenadas actuales en canvas
    const canvasPoint = screenToCanvas({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    });

    // Rectángulo en espacio canvas (para almacenar)
    const canvasX = Math.min(startPoint.current.x, canvasPoint.x);
    const canvasY = Math.min(startPoint.current.y, canvasPoint.y);
    const canvasWidth = Math.abs(canvasPoint.x - startPoint.current.x);
    const canvasHeight = Math.abs(canvasPoint.y - startPoint.current.y);

    // Rectángulo en espacio pantalla (para visualización)
    const screenStart = canvasToScreen(startPoint.current);
    const screenEnd = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    const screenX = Math.min(screenStart.x, screenEnd.x);
    const screenY = Math.min(screenStart.y, screenEnd.y);
    const screenWidth = Math.abs(screenEnd.x - screenStart.x);
    const screenHeight = Math.abs(screenEnd.y - screenStart.y);

    rect.current = {
      canvasRect: { x: canvasX, y: canvasY, width: canvasWidth, height: canvasHeight },
      screenRect: { x: screenX, y: screenY, width: screenWidth, height: screenHeight }
    };

    drawRect();
  };

  const onMouseUp = () => {
    if (!isDrawing.current || !rect.current?.canvasRect) return;
    isDrawing.current = false;

    // Guardar el rectángulo en coordenadas de canvas
    useCanvasStore.getState().addElement({
      type: 'rectangle',
      data: rect.current.canvasRect,
      points: rect.current.canvasRect
    });

    rect.current = { canvasRect: null, screenRect: null };
  };

  const onMouseLeave = onMouseUp;

  const drawRect = () => {
    if (!interactionCtxRef.current || !rect.current?.screenRect) return;
    const ctx = interactionCtxRef.current;

    // Limpiar solo el canvas de interacción
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Dibujar el rectángulo temporal en coordenadas de pantalla
    const { x, y, width, height } = rect.current.screenRect;
    ctx.strokeRect(x, y, width, height);
  };

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};