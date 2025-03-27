import { useState, useCallback } from 'react';
import { useCanvasStore } from '@/store/canvasStore';

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;

export const useZoom = () => {
  const { setViewState, viewState } = useCanvasStore();
  const [zoom, setZoom] = useState(1.0);

  const updateZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.min(Math.max(newZoom, ZOOM_MIN), ZOOM_MAX);
    setZoom(clampedZoom);
    setViewState({ ...viewState, zoom: clampedZoom });
    return clampedZoom;
  }, [viewState]);

  const zoomIn = useCallback(() => updateZoom(zoom * (1 + ZOOM_STEP)), [zoom, updateZoom]);
  const zoomOut = useCallback(() => updateZoom(zoom / (1 + ZOOM_STEP)), [zoom, updateZoom]);
  const resetZoom = useCallback(() => updateZoom(1.0), [updateZoom]);

  return { 
    zoom, 
    zoomIn, 
    zoomOut, 
    resetZoom,
    updateZoom,
    canZoomIn: zoom < ZOOM_MAX,
    canZoomOut: zoom > ZOOM_MIN
  };
};