import { useCanvasStore } from "@/store/canvasStore";
import { useCallback, useEffect } from "react";
import { Quadtree } from "@/app/hooks/useQuadtree";

export const useCanvasDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  quadtreeRef: React.RefObject<Quadtree | null>
) => {
  const { elements, temporaryElements } = useCanvasStore();

  const drawQuadtree = useCallback((ctx: CanvasRenderingContext2D, node: Quadtree, depth = 0) => {
    if (!node) return;

    const colors = ['rgba(255,0,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,0,255,0.3)', 'rgba(255,255,0,0.3)'];
    const color = colors[Math.min(depth, colors.length - 1)];

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(
      node.boundary.x,
      node.boundary.y,
      node.boundary.width,
      node.boundary.height
    );
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    node.elements.forEach(element => {
      ctx.fillRect(
        element.points.x,
        element.points.y,
        element.points.width,
        element.points.height
      );
    });

    if (node.divided) {
      drawQuadtree(ctx, node.northeast!, depth + 1);
      drawQuadtree(ctx, node.northwest!, depth + 1);
      drawQuadtree(ctx, node.southeast!, depth + 1);
      drawQuadtree(ctx, node.southwest!, depth + 1);
    }
  }, []);

  const drawElements = useCallback((ctx: CanvasRenderingContext2D) => {
    console.log('Drawing elements en el canvas principal');
    const elementsToDraw = elements.filter(
      el => !temporaryElements.some(tempEl => tempEl.id === el.id)
    );
    
    elementsToDraw.forEach(element => {
      if (element.type === "pencil") {
        const path = new Path2D(element.data);
        ctx.fill(path);
      } else if (element.type === "rectangle") {
        ctx.strokeRect(
          element.data.x,
          element.data.y,
          element.data.width,
          element.data.height
        );
      }
    });
  }, [elements, temporaryElements]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !quadtreeRef.current) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawQuadtree(ctx, quadtreeRef.current);
    drawElements(ctx);
  }, [canvasRef, quadtreeRef, drawQuadtree, drawElements]);
};