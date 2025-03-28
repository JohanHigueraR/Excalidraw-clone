// useZoom.ts
import { useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

const ZOOM_MIN = 10;    // 10%
const ZOOM_MAX = 200;   // 200%
const ZOOM_STEP = 10;   // Incrementos de 10%
const ZOOM_DEFAULT = 100; // 100%

export const useZoom = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  // Modificamos el store para usar porcentajes (10-200)
  const { zoom = ZOOM_DEFAULT, setZoom, offset, setOffset } = useCanvasStore();

  // Convertimos el porcentaje a factor de escala (ej. 100% → 1.0)
  const zoomFactor = zoom / 100;

  const applyZoomTransformation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoomFactor, zoomFactor);
  }, [zoomFactor, offset, canvasRef]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      
      // Determinamos la dirección del zoom (1 para acercar, -1 para alejar)
      const direction = e.deltaY > 0 ? -1 : 1;
      
      // Calculamos el nuevo zoom con incrementos de 10%
      let newZoom = zoom + (direction * ZOOM_STEP);
      
      // Aseguramos que esté dentro de los límites
      newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
      
      // Solo actualizamos si hubo cambio
      if (newZoom !== zoom) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convertimos a factores para el cálculo del offset
        const currentFactor = zoom / 100;
        const newFactor = newZoom / 100;
        
        const newOffsetX = mouseX - (mouseX - offset.x) * (newFactor / currentFactor);
        const newOffsetY = mouseY - (mouseY - offset.y) * (newFactor / currentFactor);
        
        setZoom(newZoom);
        setOffset({ x: newOffsetX, y: newOffsetY });
      }
    }
  }, [zoom, offset, canvasRef, setZoom, setOffset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const options = { passive: false, capture: true };
    canvas.addEventListener('wheel', handleWheel, options);
    document.addEventListener('wheel', handleWheel, options);

    return () => {
      canvas.removeEventListener('wheel', handleWheel, options);
      document.removeEventListener('wheel', handleWheel, options);
    };
  }, [handleWheel, canvasRef]);

  // Función para cambiar el zoom programáticamente
  const changeZoom = useCallback((newZoom: number, focalPoint?: { x: number; y: number }) => {
    newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(newZoom / ZOOM_STEP) * ZOOM_STEP))
    
    if (focalPoint) {
      const currentFactor = zoom / 100;
      const newFactor = newZoom / 100;
      
      const newOffsetX = focalPoint.x - (focalPoint.x - offset.x) * (newFactor / currentFactor);
      const newOffsetY = focalPoint.y - (focalPoint.y - offset.y) * (newFactor / currentFactor);
      
      setOffset({ x: newOffsetX, y: newOffsetY });
    }
    
    setZoom(newZoom);
  }, [zoom, offset, setZoom, setOffset]);

  return {
    applyZoomTransformation,
    zoom,         // Valor actual en porcentaje (10-200)
    zoomFactor,   // Factor de escala (0.1-2.0)
    offset,
    changeZoom    // Función para controlar el zoom programáticamente
  };
};