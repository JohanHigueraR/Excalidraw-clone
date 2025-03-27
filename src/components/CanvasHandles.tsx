import React from 'react';
import { Element } from '@/types/types';
import useCanvasEditor from '@/app/hooks/useCanvasEditor';
import { useCanvasStore } from '@/store/canvasStore';

interface CanvasHandlesProps {
  interactionCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  interactionCtxRef: React.RefObject<CanvasRenderingContext2D | null>;
}

const CanvasHandles: React.FC<CanvasHandlesProps> = ({ interactionCanvasRef, interactionCtxRef }) => {
  const { handleResizeStart, isResizing, editingBox } = useCanvasEditor(interactionCanvasRef, interactionCtxRef);
  const { selectedElements } = useCanvasStore();
  if (selectedElements.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: editingBox.x,
        top: editingBox.y,
        width: editingBox.width,
        height: editingBox.height,
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