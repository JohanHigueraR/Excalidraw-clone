"use client";
import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/store/canvasStore';
import { useToolsStore } from '@/store/toolsStore';
import { usePencil } from '@/tools/usePencil';
import { useRectangle } from '@/tools/useRectangle';

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { elements } = useCanvasStore();
  const { selectedTool } = useToolsStore();

  // Inicializar el contexto del canvas y ajustar el tamaño
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;

    // Función para ajustar el tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Ajustar el tamaño inicial
    resizeCanvas();

    // Escuchar el evento de redimensionamiento de la ventana
    window.addEventListener('resize', resizeCanvas);

    // Limpiar el event listener al desmontar el componente
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Usar el hook correspondiente según la herramienta seleccionada
  const pencilHandlers = usePencil(canvasRef, ctxRef);
  const rectangleHandlers = useRectangle(canvasRef, ctxRef);

  const getHandlers = () => {
    switch (selectedTool) {
      case 'pencil':
        return pencilHandlers;
      case 'rectangle':
        return rectangleHandlers;
      default:
        return {};
    }
  };

  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = getHandlers();

  // Dibujar todos los elementos almacenados
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    const ctx = ctxRef.current;

    // Limpiar el canvas antes de redibujar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar todos los elementos
    elements.forEach((element) => {
      if (element.type === 'pencil') {
        const path = new Path2D(element.data);
        ctx.fill(path);
      } else if (element.type === 'rectangle') {
        ctx.strokeRect(element.data.x, element.data.y, element.data.width, element.data.height);
      }
    });
  }, [elements]);

  return (
    <canvas
      className="bg-gray-400 w-full h-full"
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    />
  );
};

export default Canvas;