import { RefObject, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import getStroke from 'perfect-freehand';
import { getSvgPathFromStroke } from '@/utils/getSvgPathFromStroke';
import { calculateBoundingBox } from '@/utils/calculateBoundingBox';

export const usePencil = (
  interactionCanvasRef: RefObject<HTMLCanvasElement>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>
) => {
  const isDrawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactionCanvasRef.current || !interactionCtxRef.current) return;
    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    points.current = [{ x: offsetX, y: offsetY }];
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !interactionCanvasRef.current || !interactionCtxRef.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    points.current.push({ x: offsetX, y: offsetY });
    drawStroke();
  };

  const onMouseUp = () => {
    if (!isDrawing.current || !interactionCtxRef.current || points.current.length === 0) return;
    isDrawing.current = false;

    const stroke = getStroke(
      points.current.map((p) => [p.x, p.y]),
      {
        size: 8,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      }
    );

    const pathData = getSvgPathFromStroke(stroke);
    const boundingBox = calculateBoundingBox(points.current);
    useCanvasStore.getState().addElement({
      type: 'pencil',
      data: pathData,
      points: boundingBox,
    });

    points.current = [];
  };

  const onMouseLeave = onMouseUp;

  const drawStroke = () => {
    if (!interactionCtxRef.current) return;
    const ctx = interactionCtxRef.current;

    // Limpiar solo el canvas de interacción
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Dibujar el trazo actual
    if (points.current.length > 0) {
      const stroke = getStroke(
        points.current.map((p) => [p.x, p.y]),
        {
          size: 8,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        }
      );

      const pathData = getSvgPathFromStroke(stroke);
      const path = new Path2D(pathData);
      ctx.fill(path);
    }
  };

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};