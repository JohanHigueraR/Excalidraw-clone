import { RefObject, useState, useEffect} from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Element, HandleTypes } from '@/types/types';
import { calculateBoundingBoxForElements } from '@/utils/calculateBoundingBox';

const useCanvasEditor = (
  selectedElements: Element[],
  interactionCanvasRef: RefObject<HTMLCanvasElement | null>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>
) => {
  const { updateElement } = useCanvasStore();

  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [initialBoundingBox, setInitialBoundingBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [handleType, setHandleType] = useState<HandleTypes | null>(null);

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, type: HandleTypes) => {
    e.stopPropagation();
    setIsResizing(true);
    setHandleType(type);
    setInitialMousePosition({ x: e.clientX, y: e.clientY });
    setInitialBoundingBox(calculateBoundingBoxForElements(selectedElements));
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !handleType || !interactionCtxRef.current) return;

    const deltaX = e.clientX - initialMousePosition.x;
    const deltaY = e.clientY - initialMousePosition.y;

    let newWidth = initialBoundingBox.width;
    let newHeight = initialBoundingBox.height;
    let newX = initialBoundingBox.x;
    let newY = initialBoundingBox.y;

    switch (handleType) {
      case 'top-left':
        newWidth -= deltaX;
        newHeight -= deltaY;
        newX += deltaX;
        newY += deltaY;
        break;
      case 'top-right':
        newWidth += deltaX;
        newHeight -= deltaY;
        newY += deltaY;
        break;
      case 'bottom-left':
        newWidth -= deltaX;
        newHeight += deltaY;
        newX += deltaX;
        break;
      case 'bottom-right':
        newWidth += deltaX;
        newHeight += deltaY;
        break;
      default:
        break;
    }

    // Calcular la relación de escalado
    const scaleX = newWidth / initialBoundingBox.width;
    const scaleY = newHeight / initialBoundingBox.height;

    // Redibujar el cuadro de selección en el canvas de interacción
    const ctx = interactionCtxRef.current;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(newX, newY, newWidth, newHeight);

    // Actualizar el estado de los elementos seleccionados
    selectedElements.forEach((element) => {
      const { x, y, width, height } = element.points;
      const updatedX = newX + (x - initialBoundingBox.x) * scaleX;
      const updatedY = newY + (y - initialBoundingBox.y) * scaleY;
      const updatedWidth = width * scaleX;
      const updatedHeight = height * scaleY;

      updateElement(element.id, {
        ...element,
        points: { x: updatedX, y: updatedY, width: updatedWidth, height: updatedHeight },
      });
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setHandleType(null);
  };

  // Efecto para manejar eventos de mouse globales
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResize, handleResizeEnd]);

  return {
    handleResizeStart,
    isResizing,
  };
};

export default useCanvasEditor;