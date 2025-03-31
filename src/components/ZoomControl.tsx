"use client"
import { useCanvasStore } from "@/store/canvasStore";
import { useEffect, useState } from "react";

type ZoomControlsProps = {
  handleZoom: (newZoom: number, focalPoint?: {
    x: number;
    y: number;
  }) => void
}

export const ZoomControls = ({ handleZoom }: ZoomControlsProps) => {
  const { zoom } = useCanvasStore()
  const [focalPoint, setFocalPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Esto solo se ejecuta en el cliente
    setFocalPoint({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
  }, []);

  const handleZoomIn = () => {
    handleZoom(zoom + 10, focalPoint); // Aumenta en 10%
  };

  const handleZoomOut = () => {
    handleZoom(zoom - 10, focalPoint); // Disminuye en 10%
  };

  const handleReset = () => {
    handleZoom(100, focalPoint); // Restablece al 100%
  };
  return (
    <div className="fixed bottom-4 left-4 bg-white p-2 rounded-md shadow-lg flex items-center gap-3 z-30">
      <button
        onClick={handleZoomOut}
        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"

      >
        -
      </button>
      <span className="text-sm w-12 text-center">
        {zoom}%
      </span>
      <button
        onClick={handleZoomIn}
        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"

      >
        +
      </button>
      <button
        onClick={handleReset}
        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
      >
        Reset
      </button>
    </div>
  );
};