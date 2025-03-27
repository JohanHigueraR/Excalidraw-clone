"use client";
import React, { forwardRef, useEffect } from "react";

interface CanvasLayerProps {
  className?: string;
  zIndex: number;
  onContextReady?: (ctx: CanvasRenderingContext2D) => void;
  handlers?: React.HTMLAttributes<HTMLCanvasElement>;
  width?: number;
  height?: number;
}

const CanvasLayer = forwardRef<HTMLCanvasElement, CanvasLayerProps>(
  ({ className = "", zIndex, onContextReady, handlers, width, height }, ref) => {
    const internalRef = React.useRef<HTMLCanvasElement>(null);

    // Solución: Unificar las refs de manera segura para TypeScript
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      // Asignar la ref correctamente
      if (typeof ref === 'function') {
        ref(internalRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = internalRef.current;
      }

      canvasRef.current = internalRef.current;
    }, [ref]);
    useEffect(() => {
      if (!canvasRef.current) return;

      // Soporte para refs function y MutableRefObject
      if (typeof ref === "function") {
        ref(canvasRef.current);
      } else if (ref) {
        ref.current = canvasRef.current;
      }

      // Notifica cuando el contexto está listo
      const ctx = canvasRef.current.getContext("2d");
      if (ctx && onContextReady) onContextReady(ctx);
    }, [ref, onContextReady]);

    return (
      <canvas
        ref={internalRef}
        className={`absolute top-0 left-0 ${className}`}
        style={{ zIndex }}
        width={width}
        height={height}
        {...handlers}
      />
    );
  }
);

CanvasLayer.displayName = "CanvasLayer";

export default CanvasLayer;