import { RefObject, useRef } from "react";
import getStroke from "perfect-freehand";

const getSvgPathFromStroke = (stroke: number[][]) => {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );
  d.push("Z");
  return d.join(" ");
};

export const usePencil = (
  canvasRef: RefObject<HTMLCanvasElement>,
  ctxRef: RefObject<CanvasRenderingContext2D | null>
) => {
  const isDrawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const history = useRef<Path2D[]>([]); // Guarda los trazos anteriores

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !ctxRef.current) return;
    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    points.current = [{ x: offsetX, y: offsetY }];
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !canvasRef.current || !ctxRef.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    points.current.push({ x: offsetX, y: offsetY });
    drawStroke();
  };

  const onMouseUp = () => {
    if (!isDrawing.current || !ctxRef.current || points.current.length === 0) return;
    isDrawing.current = false;

    // Guardar el trazo en el historial para mantenerlo en pantalla
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
    history.current.push(path); // Agregamos el trazo al historial

    points.current = [];
  };

  const onMouseLeave = onMouseUp;

  const drawStroke = () => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;

    // Limpiar solo la parte nueva, sin borrar trazos anteriores
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Volver a dibujar todo el historial
    ctx.fillStyle = "black";
    history.current.forEach((path) => ctx.fill(path));

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
