import { RefObject, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from '@/utils/getSvgPathFromStroke';
import { calculateBoundingBox } from '@/utils/calculateBoundingBox';

export const usePencil = (
  interactionCanvasRef: RefObject<HTMLCanvasElement>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>,
  screenToCanvas: (point: { x: number; y: number }) => { x: number; y: number },
  canvasToScreen: (point: { x: number; y: number }) => { x: number; y: number },
  zoom: number
) => {
  const isDrawing = useRef(false);
  const canvasPoints = useRef<{ x: number; y: number }[]>([]);
  const screenPoints = useRef<{ x: number; y: number }[]>([]);

 // Versión con tamaño mínimo/máximo
const getVisualConsistentSize = (baseSize: number) => {
  const zoomFactor = zoom / 100;
  const calculatedSize = baseSize / zoomFactor;
  console.log('calculatedSize', calculatedSize)
  return calculatedSize
};

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactionCanvasRef.current || !interactionCtxRef.current) return;
    
    isDrawing.current = true;
    const canvasPoint = screenToCanvas({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    });
    const screenPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    
    canvasPoints.current = [canvasPoint];
    screenPoints.current = [screenPoint];
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !interactionCanvasRef.current || !interactionCtxRef.current) return;
    
    const canvasPoint = screenToCanvas({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY
    });
    const screenPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    
    canvasPoints.current.push(canvasPoint);
    screenPoints.current.push(screenPoint);
    
    drawStroke();
  };

  const onMouseUp = () => {
    if (!isDrawing.current || !interactionCtxRef.current || canvasPoints.current.length === 0) return;
    isDrawing.current = false;

    const stroke = getStroke(
      canvasPoints.current.map((p) => [p.x, p.y]),
      {
        size:getVisualConsistentSize(8),
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      }
    );

    const pathData = getSvgPathFromStroke(stroke);
    const boundingBox = calculateBoundingBox(canvasPoints.current);
    
    useCanvasStore.getState().addElement({
      type: 'pencil',
      data: pathData,
      points: boundingBox,
    });

    canvasPoints.current = [];
    screenPoints.current = [];
  };

  const onMouseLeave = onMouseUp;

  const drawStroke = () => {
    if (!interactionCtxRef.current || screenPoints.current.length === 0) return;
    const ctx = interactionCtxRef.current;

    // Limpiar solo el canvas de interacción
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Dibujar el trazo actual usando puntos de pantalla para la visualización temporal
    const stroke = getStroke(
      screenPoints.current.map((p) => [p.x, p.y]),
      {
        size:8,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      }
    );

    const pathData = getSvgPathFromStroke(stroke);
    const path = new Path2D(pathData);
    ctx.fill(path);
  };

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};