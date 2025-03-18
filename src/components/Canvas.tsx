"use client"
import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/store/canvasStore"; // Estado global de Zustand
import {usePencil} from "@/tools/usePencil";
import {useRectangle} from "@/tools/useRectangle";

const CanvasDesktop = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const selectedTool = useCanvasStore((state) => state.selectedTool);

  // Inicializamos todas las herramientas
  
  const pencilTool = usePencil(canvasRef, ctxRef);
  const rectangleTool = useRectangle(canvasRef, ctxRef);

  // Seleccionamos la herramienta actual sin cambiar el orden de los hooks
  const currentTool = selectedTool === "pencil" ? pencilTool :
                      selectedTool === "rectangle" ? rectangleTool :
                      null;

  // Configurar el Canvas al montar el componente
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;
    
    // Ajustar tamaño del canvas a la ventana
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full bg-gray-500 cursor-crosshair"
      onMouseDown={currentTool?.onMouseDown}
      onMouseMove={currentTool?.onMouseMove}
      onMouseUp={currentTool?.onMouseUp}
    />
  );
};

export default CanvasDesktop;
