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

    useEffect(() => {
      if (!internalRef.current) return;

      // Asignar la ref
      if (typeof ref === 'function') {
        ref(internalRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = internalRef.current;
      }

      // Notificar cuando el contexto está listo
      const ctx = internalRef.current.getContext("2d");
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