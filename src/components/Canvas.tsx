"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useToolsStore } from '@/store/toolsStore';
import { usePencil } from '@/tools/usePencil';
import { useRectangle } from '@/tools/useRectangle';

const Canvas = () => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const interactionCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { elements } = useCanvasStore();
  const { selectedTool } = useToolsStore();

  // Estado para almacenar las dimensiones del canvas
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

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

        // Establecer el tamaño inicial del canvas
        setCanvasSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });

        // Escuchar el evento de redimensionamiento de la ventana
        const handleResize = () => {
          setCanvasSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        };

        window.addEventListener('resize', handleResize);

        // Limpiar el event listener al desmontar el componente
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
    console.log('redibujando canvas de fondo');
    // Limpiar el canvas de fondo
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Dibujar todos los elementos almacenados
    elements.forEach((element) => {
      if (element.type === 'pencil') {
        const path = new Path2D(element.data);
        ctx.fill(path);
      } else if (element.type === 'rectangle') {
        ctx.strokeRect(element.data.x, element.data.y, element.data.width, element.data.height);
      }
    });
  }, [elements]);

  // Usar el hook correspondiente según la herramienta seleccionada
  const pencilHandlers = usePencil(
    interactionCanvasRef as React.RefObject<HTMLCanvasElement>,
    interactionCtxRef as React.RefObject<CanvasRenderingContext2D>
  );
  const rectangleHandlers = useRectangle(
    interactionCanvasRef as React.RefObject<HTMLCanvasElement>,
    interactionCtxRef as React.RefObject<CanvasRenderingContext2D>
  );

  const getHandlers = () => {
    switch (selectedTool) {
      case 'pencil':
        return pencilHandlers;
      case 'rectangle':
        return rectangleHandlers;
      default:
        return pencilHandlers;
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
    </div>
  );
};

export default Canvas;