import { create } from "zustand";
import { Path, Rectangle, Tool } from "@/types/types";

interface CanvasState {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;

  strokeColor: string;
  strokeWidth: number;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;

  paths: Path[];
  addPath: (path: Path) => void;
  updatePath: (id: string, points: { x: number; y: number }[]) => void;

  rectangles: Rectangle[];
  addRectangle: (rectangle: Rectangle) => void;
  updateRectangle: (id: string, updates: Partial<Rectangle>) => void;

  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  selectedTool: "pencil",
  setSelectedTool: (tool) => set({ selectedTool: tool }),

  strokeColor: "#000000",
  strokeWidth: 3,
  setStrokeColor: (color) => set({ strokeColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),

  paths: [],
  addPath: (path) => set((state) => ({ paths: [...state.paths, path] })),
  updatePath: (id, points) =>
    set((state) => ({
      paths: state.paths.map((path) =>
        path.id === id ? { ...path, points } : path
      ),
    })),

  rectangles: [],
  addRectangle: (rectangle) =>
    set((state) => ({ rectangles: [...state.rectangles, rectangle] })),
  updateRectangle: (id, updates) =>
    set((state) => ({
      rectangles: state.rectangles.map((rect) =>
        rect.id === id ? { ...rect, ...updates } : rect
      ),
    })),

  clearCanvas: () => set({ paths: [], rectangles: [] }),
}));
