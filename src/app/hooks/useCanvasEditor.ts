import { RefObject, useState, useEffect, useCallback, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { Element, HandleTypes } from '@/types/types';
const calculateBoundingBox = (elements: Element[]) => {
  console.log('calculando bounding box de', elements)
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((element) => {
    const { x, y, width, height } = element.points;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  // Añadir un margen de 10px alrededor del contenido
  const margin = 10;
  return {
    x: minX - margin,
    y: minY - margin,
    width: maxX - minX + 2 * margin,
    height: maxY - minY + 2 * margin,
  };
};

const useCanvasEditor = (
  interactionCanvasRef: RefObject<HTMLCanvasElement | null>,
  interactionCtxRef: RefObject<CanvasRenderingContext2D | null>
) => {
  const { updateElement, setSelectedElements, setTemporaryElements, clearTemporaryElements, clearSelectedElements, selectedElements } = useCanvasStore();
  const resize = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [initialBoundingBox, setInitialBoundingBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [handleType, setHandleType] = useState<HandleTypes | null>(null);
  const [editingBox, setEditingBox] = useState({ x: 0, y: 0, width: 0, height: 0 }); // Estado para el cuadro de edición

  // Efecto para inicializar el cuadro de edición cuando cambian los elementos seleccionados
  useEffect(() => {
    if (selectedElements.length > 0) {
      const boundingBox = calculateBoundingBox(selectedElements);
      setEditingBox(boundingBox); // Inicializar el cuadro de edición
    } else {
      setEditingBox({ x: 0, y: 0, width: 0, height: 0 }); // Limpiar el cuadro de edición si no hay elementos seleccionados
    }
  }, [selectedElements]);

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, type: HandleTypes) => {
    e.stopPropagation();
    setIsResizing(true);
    setHandleType(type);
    setInitialMousePosition({ x: e.clientX, y: e.clientY });
    const boundingBox = calculateBoundingBox(selectedElements);
    setInitialBoundingBox(boundingBox);
    setTemporaryElements(selectedElements); // Almacenar los elementos seleccionados en el store
    setEditingBox(boundingBox); // Actualizar el cuadro de edición al iniciar el redimensionamiento
  };

  const handleResize = useCallback((e: MouseEvent) => {
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

    // Almacenar el nuevo tamaño y posición en resize.current
    resize.current = { x: newX, y: newY, width: newWidth, height: newHeight };

    // Actualizar el cuadro de edición
    setEditingBox({ x: newX, y: newY, width: newWidth, height: newHeight });

    // Redibujar los elementos en el canvas de interacción
    const ctx = interactionCtxRef.current;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    selectedElements.forEach((element) => {
      const { x, y, width, height } = element.points;
      const updatedX = newX + (x - initialBoundingBox.x) * scaleX;
      const updatedY = newY + (y - initialBoundingBox.y) * scaleY;
      const updatedWidth = width * scaleX;
      const updatedHeight = height * scaleY;

      // Dibujar el elemento en el canvas de interacción
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.strokeRect(updatedX, updatedY, updatedWidth, updatedHeight);
    });
  }, [isResizing, handleType, initialMousePosition, initialBoundingBox, selectedElements, interactionCtxRef]);

  const handleResizeEnd = useCallback(() => {
    if (!isResizing || !handleType || !interactionCtxRef.current || !resize.current) return;
  
    const ctx = interactionCtxRef.current;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
    const scaleX = resize.current.width / initialBoundingBox.width;
    const scaleY = resize.current.height / initialBoundingBox.height;
  
    // 1. Primero actualiza todos los elementos
    const updatedElements = selectedElements.map((element) => {
      const { x, y, width, height } = element.points;
      const updatedX = resize.current!.x + (x - initialBoundingBox.x) * scaleX;
      const updatedY = resize.current!.y + (y - initialBoundingBox.y) * scaleY;
      const updatedWidth = width * scaleX;
      const updatedHeight = height * scaleY;
  
      return {
        ...element,
        data: { x: updatedX, y: updatedY, width: updatedWidth, height: updatedHeight },
        points: { x: updatedX, y: updatedY, width: updatedWidth, height: updatedHeight },
      };
    });
-  
    // 2. Actualiza el store en batch
    updatedElements.forEach(element => updateElement(element.id, element));
    
    // 3. Luego actualiza los elementos seleccionados
    setSelectedElements(updatedElements);
  
    // 4. Calcula el NUEVO bounding box basado en los elementos actualizados
    const newBoundingBox = calculateBoundingBox(updatedElements);
    setInitialBoundingBox(newBoundingBox); // <-- Esto es clave
  
    clearTemporaryElements();
    setIsResizing(false);
    setHandleType(null);
    resize.current = null;
  }, [isResizing, handleType, initialBoundingBox, selectedElements, updateElement, interactionCtxRef]);
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
    editingBox, // Devolver el estado del cuadro de edición
  };
};

export default useCanvasEditor;