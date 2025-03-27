import React, { ReactNode, useRef, Children, isValidElement, useEffect } from 'react';
import { useWheelZoom } from '@/app/hooks/useWheelZoom';

interface ZoomManagerProps {
  children: ReactNode;
}

export const ZoomManager = ({ children }: ZoomManagerProps) => {
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Bloqueo global del Ctrl + Rueda
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Captura el evento en fase de captura (antes que cualquier otro)
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, []);

  useWheelZoom(zoomCanvasRef); // Tu hook personalizado de zoom

  return (
    <div className="relative w-full h-full">
      {Children.map(children, (child) => {
        if (isValidElement(child) && child.props.zIndex === 20) {
          const combinedRef = (instance: HTMLCanvasElement | null) => {
            zoomCanvasRef.current = instance;
            
            if (typeof child.ref === 'function') {
              child.ref(instance);
            } else if (child.ref) {
              (child.ref as React.MutableRefObject<HTMLCanvasElement | null>).current = instance;
            }
          };

          return React.cloneElement(child, { 
            ref: combinedRef,
            ...child.props
          });
        }
        return child;
      })}
    </div>
  );
};