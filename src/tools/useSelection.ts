import { RefObject, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Quadtree } from '@/tools/useQuadtree'; // Importar la clase Quadtree
import { Element } from '@/types/types';

export const useSelection = (
  interactionCanvasRef: RefObject<HTMLCanvasElement>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>,
  quadtreeRef: RefObject<Quadtree | null> // Pasar el Quadtree como parámetro
) => {
  const { elements } = useCanvasStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactionCanvasRef.current || !interactionCtxRef.current || !quadtreeRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;

    // Iniciar el rectángulo de selección
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

    // Calcular el rectángulo de selección final
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
          // Verificar si el rectángulo está completamente dentro del rango de selección
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
    console.log('Elementos seleccionados:', selectedElements);

    // Limpiar el rectángulo de selección
    setSelectionRect(null);
    if (interactionCtxRef.current) {
      interactionCtxRef.current.clearRect(0, 0, interactionCtxRef.current.canvas.width, interactionCtxRef.current.canvas.height);
    }
  };
  const onMouseLeave = onMouseUp;

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};