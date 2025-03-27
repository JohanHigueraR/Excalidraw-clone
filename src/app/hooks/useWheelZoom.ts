import { useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

export const useWheelZoom = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const { viewState, setViewState } = useCanvasStore();

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!canvasRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();

    const { zoom, offsetX, offsetY } = viewState;
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Coordenadas del mouse relativas al canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Coordenadas del mouse en el espacio del canvas (antes del zoom)
    const canvasX = (mouseX - offsetX) / zoom;
    const canvasY = (mouseY - offsetY) / zoom;

    // Factor de zoom (aumentar o disminuir)
    const delta = -e.deltaY;
    const zoomFactor = 1.1; // Factor de zoom por paso
    const newZoom = delta > 0 
      ? Math.min(zoom * zoomFactor, 2.0) // Zoom in
      : Math.max(zoom / zoomFactor, 0.1); // Zoom out

    // Calcular nuevos offsets para mantener la posición bajo el cursor
    const newOffsetX = mouseX - canvasX * newZoom;
    const newOffsetY = mouseY - canvasY * newZoom;

    setViewState({
      zoom: newZoom,
      offsetX: newOffsetX,
      offsetY: newOffsetY
    });
  }, [viewState, setViewState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);
};