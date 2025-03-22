export type Point = { x: number; y: number };

export type Path = {
  id: string;
  points: Point[];
  stroke: string;
  strokeWidth: number;
};

export type Rectangle = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  strokeWidth: number;
  fill?: string;
};


export type ToolType = "select" | "pencil" | "rectangle" | "circle" | "arrow" | "line" | "eraser" | "text" | "resize";
export type HandleTypes = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type Element = {
  id: string; // ID único para cada elemento
  type: ToolType;
  data: any; 
  points: { x: number; y: number; width: number; height: number }; // Puntos de control para el trazo
};
