import { RefObject, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Quadtree } from '@/app/hooks/useQuadtree';
import { Element, Boundary } from '@/types/types';

export const useSelection = (
  interactionCanvasRef: RefObject<HTMLCanvasElement>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>,
  quadtreeRef: RefObject<Quadtree | null>,
  screenToCanvas: (point: { x: number; y: number }) => { x: number; y: number },
  canvasToScreen: (point: { x: number; y: number }) => { x: number; y: number }
) => {
  const { setSelectedElements, elements } = useCanvasStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    canvasRect: Boundary | null;
    screenRect: Boundary | null;
  }>({ canvasRect: null, screenRect: null });

  const getCurrentElements = (selected: Element[]) => {
    return selected.map(selectedEl => 
      elements.find(el => el.id === selectedEl.id) || selectedEl
    ).filter(Boolean);
  };

  const isFullyContained = (selection: Boundary, element: Element): boolean => {
    return (
      element.points.x >= selection.x &&
      element.points.x + element.points.width <= selection.x + selection.width &&
      element.points.y >= selection.y &&
      element.points.y + element.points.height <= selection.y + selection.height
    );
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactionCanvasRef.current || !interactionCtxRef.current || !quadtreeRef.current) return;

    const canvasPoint = screenToCanvas({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    setIsSelecting(true);
    setSelectionRect({
      canvasRect: { x: canvasPoint.x, y: canvasPoint.y, width: 0, height: 0 },
      screenRect: { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, width: 0, height: 0 }
    });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !interactionCanvasRef.current || !interactionCtxRef.current || !selectionRect.canvasRect) return;

    const canvasPoint = screenToCanvas({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

    // Rectángulo en espacio canvas
    const canvasX = Math.min(selectionRect.canvasRect.x, canvasPoint.x);
    const canvasY = Math.min(selectionRect.canvasRect.y, canvasPoint.y);
    const canvasWidth = Math.abs(canvasPoint.x - selectionRect.canvasRect.x);
    const canvasHeight = Math.abs(canvasPoint.y - selectionRect.canvasRect.y);

    // Rectángulo en espacio pantalla
    const screenStart = canvasToScreen({ x: selectionRect.canvasRect.x, y: selectionRect.canvasRect.y });
    const screenX = Math.min(screenStart.x, e.nativeEvent.offsetX);
    const screenY = Math.min(screenStart.y, e.nativeEvent.offsetY);
    const screenWidth = Math.abs(e.nativeEvent.offsetX - screenStart.x);
    const screenHeight = Math.abs(e.nativeEvent.offsetY - screenStart.y);

    setSelectionRect({
      canvasRect: { x: canvasX, y: canvasY, width: canvasWidth, height: canvasHeight },
      screenRect: { x: screenX, y: screenY, width: screenWidth, height: screenHeight }
    });

    drawSelection();
  };

  const onMouseUp = () => {
    if (!isSelecting || !selectionRect.canvasRect || !quadtreeRef.current) return;
    setIsSelecting(false);

    const { x, y, width, height } = selectionRect.canvasRect;
    const isClick = width < 5 && height < 5;

    if (isClick) {
      // Expandir área para detectar un solo elemento en un clic
      const clickBounds: Boundary = { x: x - 5, y: y - 5, width: 10, height: 10 };
      const intersectedElements = quadtreeRef.current.query(clickBounds);
      setSelectedElements(getCurrentElements(intersectedElements));
    } else {
      // Buscar elementos completamente dentro del área de selección
      const allElementsInArea = quadtreeRef.current.query(selectionRect.canvasRect);
      const fullyContainedElements = allElementsInArea.filter(el => isFullyContained(selectionRect.canvasRect!, el));
      setSelectedElements(getCurrentElements(fullyContainedElements));
    }

    // Limpiar selección visual
    setSelectionRect({ canvasRect: null, screenRect: null });
    if (interactionCtxRef.current) {
      interactionCtxRef.current.clearRect(0, 0, interactionCtxRef.current.canvas.width, interactionCtxRef.current.canvas.height);
    }
  };

  const onMouseLeave = onMouseUp;

  const drawSelection = () => {
    if (!interactionCtxRef.current || !selectionRect.screenRect) return;
    const ctx = interactionCtxRef.current;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const { x, y, width, height } = selectionRect.screenRect;
    ctx.strokeStyle = 'rgba(0, 100, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
  };

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};
