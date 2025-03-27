import { useEffect, useState } from "react";

export const useCanvasSetup = (multiplier = { width: 2, height: 3 }) => {
  const [canvasSize, setCanvasSize] = useState({ 
    width: 0, 
    height: 0,
    visibleWidth: 0,
    visibleHeight: 0
  });

  useEffect(() => {
    const updateSize = () => {
      const visibleWidth = window.innerWidth;
      const visibleHeight = window.innerHeight;
      
      setCanvasSize({
        width: visibleWidth * multiplier.width,
        height: visibleHeight * multiplier.height,
        visibleWidth,
        visibleHeight
      });
    };

    // Actualización inicial + evento resize
    updateSize();
    /* window.addEventListener("resize", updateSize); */
    
    // Cleanup
    return () => window.removeEventListener("resize", updateSize);
  }, [multiplier.width, multiplier.height]);

  return { 
    canvasSize,
    centerPosition: {
      x: canvasSize.width / (2 * multiplier.width),
      y: canvasSize.height / (2 * multiplier.height)
    }
  };
};