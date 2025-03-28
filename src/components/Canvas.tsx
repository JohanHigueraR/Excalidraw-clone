"use client";
import React, { useEffect, useRef } from "react";
import { useToolsStore } from "@/store/toolsStore";
import { usePencil } from "@/tools/usePencil";
import { useRectangle } from "@/tools/useRectangle";
import { useSelection } from "@/tools/useSelection";
import { useQuadtree } from "@/app/hooks/useQuadtree";
import CanvasHandles from "./CanvasHandles";
import { ZoomControls } from "./ZoomControl";
import { useCanvasDrawing } from "@/app/hooks/useCanvasDrawing";
import CanvasLayer from "./CanvasLayer";
import { useCanvasSetup } from "@/app/hooks/useCanvasSetup";
import { useZoom } from "@/app/hooks/useZoom";
import { useCanvasStore } from "@/store/canvasStore";



const Canvas = () => {
  // Cambiamos la definición para asegurar que nunca sea null
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null!); // <-- Usamos el operador non-null assertion
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null!); // <-- Igual aquí


  const { canvasSize, centerPosition } = useCanvasSetup();
  const { selectedTool } = useToolsStore();
  const { zoom, offset } = useCanvasStore();
  const quadtreeRef = useQuadtree();

  // Obtener contextos
  const backgroundCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const interactionCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  useZoom(backgroundCanvasRef);


  // Inicializar contextos cuando las refs estén listas
  useEffect(() => {
    backgroundCtxRef.current = backgroundCanvasRef.current.getContext('2d');
    interactionCtxRef.current = interactionCanvasRef.current.getContext('2d');
  }, []);

  // Configurar el dibujo del fondo - ahora sin error de tipos
  const { applyZoomTransformation } = useZoom(backgroundCanvasRef);
  const { drawAll } = useCanvasDrawing(backgroundCanvasRef, quadtreeRef, applyZoomTransformation);

  useEffect(() => {
    drawAll();
  }, [zoom, offset]); // Dependencias del zoom

  // Handlers de herramientas
  const pencilHandlers = usePencil(interactionCanvasRef, interactionCtxRef);
  const rectangleHandlers = useRectangle(interactionCanvasRef, interactionCtxRef);
  const selectHandlers = useSelection(interactionCanvasRef, interactionCtxRef, quadtreeRef);

  const currentHandlers = (() => {
    switch (selectedTool) {
      case "pencil": return pencilHandlers;
      case "rectangle": return rectangleHandlers;
      case "select": return selectHandlers;
      default: return selectHandlers;
    }
  })();

  return (

    <>
      <CanvasLayer
        ref={backgroundCanvasRef}
        zIndex={10}
        width={canvasSize.width}
        height={canvasSize.height}
        className="bg-gray-400"
        onContextReady={(ctx) => {
          backgroundCtxRef.current = ctx;
        }}
      />

      <CanvasLayer
        ref={interactionCanvasRef}
        zIndex={20}
        width={canvasSize.width}
        height={canvasSize.height}
        handlers={currentHandlers}
        onContextReady={(ctx) => {
          interactionCtxRef.current = ctx;
        }}
      />

      <CanvasHandles
        interactionCanvasRef={interactionCanvasRef}
        interactionCtxRef={interactionCtxRef}
      />
      <ZoomControls />
    </>
  );
};

export default Canvas;