import React, { useEffect } from 'react';
import { Element } from '@/types/types';
import useCanvasEditor from '@/tools/useCanvasEditor';

const calculateBoundingBox = (elements: Element[]) => {
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

interface CanvasHandlesProps {
  selectedElements: Element[];
  interactionCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  interactionCtxRef: React.RefObject<CanvasRenderingContext2D | null>;
}

const CanvasHandles: React.FC<CanvasHandlesProps> = ({ selectedElements, interactionCanvasRef, interactionCtxRef }) => {
  const { handleResizeStart, isResizing } = useCanvasEditor(selectedElements, interactionCanvasRef, interactionCtxRef);

  if (selectedElements.length === 0) return null;

  const boundingBox = calculateBoundingBox(selectedElements);

  return (
    <div
      style={{
        position: 'absolute',
        left: boundingBox.x,
        top: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
        border: '2px dashed blue',
        zIndex: 50,
      }}
    >
      {/* Handles para redimensionar */}
      <div
        style={{
          position: 'absolute',
          left: -5,
          top: -5,
          width: 10,
          height: 10,
          backgroundColor: 'red',
          cursor: 'nwse-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'top-left')}
      />
      <div
        style={{
          position: 'absolute',
          right: -5,
          top: -5,
          width: 10,
          height: 10,
          backgroundColor: 'red',
          cursor: 'nesw-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'top-right')}
      />
      <div
        style={{
          position: 'absolute',
          left: -5,
          bottom: -5,
          width: 10,
          height: 10,
          backgroundColor: 'red',
          cursor: 'nesw-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
      />
      <div
        style={{
          position: 'absolute',
          right: -5,
          bottom: -5,
          width: 10,
          height: 10,
          backgroundColor: 'red',
          cursor: 'nwse-resize',
        }}
        onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
      />
    </div>
  );
};

export default CanvasHandles;