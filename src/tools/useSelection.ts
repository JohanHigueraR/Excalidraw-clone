import { RefObject, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Quadtree } from '@/tools/useQuadtree'; // Importar la clase Quadtree
import { Element } from '@/types/types';

export const useSelection = (
  interactionCanvasRef: RefObject<HTMLCanvasElement>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>,
  quadtreeRef: RefObject<Quadtree | null>
) => {
  const {setSelectedElements } = useCanvasStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Nuevo estado para detectar arrastre

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactionCanvasRef.current || !interactionCtxRef.current || !quadtreeRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;

    // Iniciar el rectángulo de selección
    setIsSelecting(true);
    setIsDragging(false); // Inicialmente, no es un arrastre
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

    // Si el mouse se mueve, es un arrastre
    setIsDragging(true);

    // Actualizar el rectángulo de selección mientras se mueve el mouse
    setSelectionRect((prev) => {
      if (!prev) return null;
      return { ...prev, endX: offsetX, endY: offsetY };
    });

    // Dibujar el rectángulo de selección en el canvas de interacción
    const ctx = interactionCtxRef.current;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Limpiar el canvas de interacción

    if (selectionRect) {
      const { startX, startY, endX, endY } = selectionRect;
      const width = endX - startX;
      const height = endY - startY;

      ctx.strokeStyle = 'blue'; // Color del rectángulo de selección
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, width, height);
    }
  };

  const onMouseUp = () => {
    if (!isSelecting || !selectionRect || !quadtreeRef.current) return;

    // Finalizar el rectángulo de selección
    setIsSelecting(false);

    if (isDragging) {
      // Si fue un arrastre, seleccionar elementos dentro del rectángulo
      const { startX, startY, endX, endY } = selectionRect;
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);

      // Definir el rango de selección
      const range = {
        x,
        y,
        width,
        height,
        contains: (element: Element) => {
          const { x: elX, y: elY, width: elWidth, height: elHeight } = element.points;
          return (
            elX >= x &&
            elX + elWidth <= x + width &&
            elY >= y &&
            elY + elHeight <= y + height
          );
        },
        intersects: (otherRange: any) => {
          return !(
            otherRange.x > x + width ||
            otherRange.x + otherRange.width < x ||
            otherRange.y > y + height ||
            otherRange.y + otherRange.height < y
          );
        },
      };

      // Consultar el Quadtree para encontrar elementos dentro del rango de selección
      const selectedElements = quadtreeRef.current.query(range);

      // Mostrar los elementos seleccionados en la consola
      setSelectedElements(selectedElements);
    } else {
      // Si fue un clic simple, seleccionar el elemento bajo el cursor
      const { startX, startY } = selectionRect;

      // Definir un rango pequeño alrededor del clic
      const range = {
        x: startX - 5,
        y: startY - 5,
        width: 10,
        height: 10,
        contains: (element: Element) => {
          const { x: elX, y: elY, width: elWidth, height: elHeight } = element.points;
          return (
            elX + elWidth >= startX - 5 &&
            elX <= startX + 5 &&
            elY + elHeight >= startY - 5 &&
            elY <= startY + 5
          );
        },
        intersects: (otherRange: any) => {
          return !(
            otherRange.x > startX + 5 ||
            otherRange.x + otherRange.width < startX - 5 ||
            otherRange.y > startY + 5 ||
            otherRange.y + otherRange.height < startY - 5
          );
        },
      };

      // Consultar el Quadtree para encontrar elementos dentro del rango del clic
      const selectedElements = quadtreeRef.current.query(range);

      // Mostrar los elementos seleccionados en la consola
      setSelectedElements(selectedElements);
    }

    // Limpiar el rectángulo de selección
    setSelectionRect(null);
    if (interactionCtxRef.current) {
      interactionCtxRef.current.clearRect(0, 0, interactionCtxRef.current.canvas.width, interactionCtxRef.current.canvas.height);
    }
  };

  const onMouseLeave = onMouseUp;

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};