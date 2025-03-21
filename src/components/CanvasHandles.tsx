import React from 'react';
import { Element } from '@/types/types'; // Asegúrate de importar el tipo correcto

type CanvasHandlesProps = {
  selectedElement: Element | null;
};

const CanvasHandles = ({ selectedElement }: CanvasHandlesProps) => {
  if (!selectedElement) return null;

  const { x, y, width, height } = selectedElement.data;
  const handleSize = 8;

  const handles = [
    { type: 'top-left', x: x - handleSize / 2, y: y - handleSize / 2 },
    { type: 'top-right', x: x + width - handleSize / 2, y: y - handleSize / 2 },
    { type: 'bottom-left', x: x - handleSize / 2, y: y + height - handleSize / 2 },
    { type: 'bottom-right', x: x + width - handleSize / 2, y: y + height - handleSize / 2 },
    { type: 'rotate', x: x + width / 2 - handleSize / 2, y: y - 20 },
  ];

  return (
    <>
      {handles.map((handle, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: handle.x,
            top: handle.y,
            width: handleSize,
            height: handleSize,
            backgroundColor: 'blue',
          }}
        />
      ))}
    </>
  );
};

export default CanvasHandles;