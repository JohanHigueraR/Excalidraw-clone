"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useToolsStore } from '@/store/toolsStore';
import { usePencil } from '@/tools/usePencil';
import { useRectangle } from '@/tools/useRectangle';
import { useSelection } from '@/tools/useSelection';
import { useQuadtree } from '@/tools/useQuadtree'; // Importar el hook useQuadtree
import CanvasHandles from './CanvasHandles';


const Canvas = () => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const interactionCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { elements, selectedElements } = useCanvasStore();
  const { selectedTool } = useToolsStore();


  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Usar el hook useQuadtree para manejar el Quadtree
  const quadtreeRef = useQuadtree(elements);

  // Inicializar los contextos de los canvases y actualizar el tamaño
  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const interactionCanvas = interactionCanvasRef.current;

    if (backgroundCanvas && interactionCanvas) {
      const backgroundCtx = backgroundCanvas.getContext('2d');
      const interactionCtx = interactionCanvas.getContext('2d');

      if (backgroundCtx && interactionCtx) {
        backgroundCtxRef.current = backgroundCtx;
        interactionCtxRef.current = interactionCtx;

        setCanvasSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });

        const handleResize = () => {
          setCanvasSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }
    }
  }, []);

  // Redibujar el canvas de fondo cuando cambian los elementos
  useEffect(() => {
    const ctx = backgroundCtxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    elements.forEach((element) => {
      if (element.type === 'pencil') {
        const path = new Path2D(element.data);
        ctx.fill(path);
      } else if (element.type === 'rectangle') {
        ctx.strokeRect(element.data.x, element.data.y, element.data.width, element.data.height);
      }
    });
  }, [elements]);

  const pencilHandlers = usePencil(
    interactionCanvasRef as React.RefObject<HTMLCanvasElement>,
    interactionCtxRef as React.RefObject<CanvasRenderingContext2D>
  );
  const rectangleHandlers = useRectangle(
    interactionCanvasRef as React.RefObject<HTMLCanvasElement>,
    interactionCtxRef as React.RefObject<CanvasRenderingContext2D>
  );
  const selectHandlers = useSelection(
    interactionCanvasRef as React.RefObject<HTMLCanvasElement>,
    interactionCtxRef as React.RefObject<CanvasRenderingContext2D>,
    quadtreeRef // Pasar el Quadtree al hook useSelection
  );

  const getHandlers = () => {
    switch (selectedTool) {
      case 'pencil':
        return {
          ...pencilHandlers,
          onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => {
            pencilHandlers.onMouseDown(e);
          },
        };
      case 'rectangle':
        return {
          ...rectangleHandlers,
          onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => {
            rectangleHandlers.onMouseDown(e);
          },
        };
      case 'select':
        return {
          ...selectHandlers,
          onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => {
            selectHandlers.onMouseDown(e);
          },
        };
      default:
        return {
          ...selectHandlers,
          onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => {
            selectHandlers.onMouseDown(e);
          },
        };
    }
  };

  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = getHandlers();

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={backgroundCanvasRef}
        className="absolute top-0 left-0 z-10 bg-gray-400"
        width={canvasSize.width}
        height={canvasSize.height}
      />
      <canvas
        ref={interactionCanvasRef}
        className="absolute top-0 left-0 z-20"
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
      <CanvasHandles selectedElements={selectedElements} interactionCanvasRef={interactionCanvasRef} interactionCtxRef={interactionCtxRef}></CanvasHandles>
    </div >
  );
};

export default Canvas;

