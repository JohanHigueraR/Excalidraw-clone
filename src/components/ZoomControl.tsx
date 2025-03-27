import { useZoom } from '@/app/hooks/useZoom';

export const ZoomControls = () => {
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoom();

  return (
    <div className="fixed bottom-4 left-4 bg-white p-2 rounded-md shadow-lg flex items-center gap-3 z-30">
      <button 
        onClick={zoomOut}
        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        disabled={zoom <= 0.1}
      >
        -
      </button>
      <span className="text-sm w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button 
        onClick={zoomIn}
        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        disabled={zoom >= 2.0}
      >
        +
      </button>
      <button 
        onClick={resetZoom}
        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
      >
        Reset
      </button>
    </div>
  );
};