import { RefObject, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Quadtree } from '@/app/hooks/useQuadtree';
import { Element, Boundary } from '@/types/types';

export const useSelection = (
  interactionCanvasRef: RefObject<HTMLCanvasElement>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>,
  quadtreeRef: RefObject<Quadtree | null>
) => {
  const { setSelectedElements, elements } = useCanvasStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const getCurrentElements = (selected: Element[]) => {
    return selected.map(selectedEl => 
      elements.find(el => el.id === selectedEl.id) || selectedEl
    ).filter(Boolean);
  };

  const isFullyContained = (selection: Boundary, element: Element): boolean => {
    const elemBounds = {
      x: element.points.x,
      y: element.points.y,
      width: element.points.width,
      height: element.points.height
    };

    return (
      elemBounds.x >= selection.x &&
      elemBounds.x + elemBounds.width <= selection.x + selection.width &&
      elemBounds.y >= selection.y &&
      elemBounds.y + elemBounds.height <= selection.y + selection.height
    );
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactionCanvasRef.current || !interactionCtxRef.current || !quadtreeRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    setIsSelecting(true);
    setSelectionRect({
      startX: offsetX,
      startY: offsetY,
      endX: offsetX,
      endY: offsetY,
    });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !interactionCanvasRef.current || !interactionCtxRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;
    setSelectionRect(prev => prev ? { ...prev, endX: offsetX, endY: offsetY } : null);

    // Dibujar selección
    const ctx = interactionCtxRef.current;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if (selectionRect) {
      const { startX, startY, endX, endY } = selectionRect;
      ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(
        Math.min(startX, endX),
        Math.min(startY, endY),
        Math.abs(endX - startX),
        Math.abs(endY - startY)
      );
      ctx.setLineDash([]);
    }
  };

  const onMouseUp = () => {
    if (!isSelecting || !selectionRect || !quadtreeRef.current) return;
    setIsSelecting(false);

    const { startX, startY, endX, endY } = selectionRect;
    const isClick = Math.abs(endX - startX) < 5 && Math.abs(endY - startY) < 5;

    const selectionBounds: Boundary = {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY)
    };

    // Para clicks, usamos intersección en lugar de contención
    if (isClick) {
      selectionBounds.x -= 5;
      selectionBounds.y -= 5;
      selectionBounds.width += 10;
      selectionBounds.height += 10;
      
      // Consulta normal por intersección para clicks
      const intersectedElements = quadtreeRef.current.query(selectionBounds);
      setSelectedElements(getCurrentElements(intersectedElements));
    } else {
      // Para selección por arrastre, filtramos solo los completamente contenidos
      const allElementsInArea = quadtreeRef.current.query(selectionBounds);
      const fullyContainedElements = allElementsInArea.filter(el => 
        isFullyContained(selectionBounds, el)
      );
      setSelectedElements(getCurrentElements(fullyContainedElements));
    }

    // Limpiar selección visual
    setSelectionRect(null);
    if (interactionCtxRef.current) {
      interactionCtxRef.current.clearRect(0, 0, 
        interactionCtxRef.current.canvas.width, 
        interactionCtxRef.current.canvas.height
      );
    }
  };

  const onMouseLeave = onMouseUp;

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};