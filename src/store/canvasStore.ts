import {create} from 'zustand';

type Tool = 'pencil' | 'rectangle'; // Agrega más herramientas según sea necesario

type Element = {
  type: Tool;
  data: any; // Puedes ajustar el tipo de "data" según la herramienta
};

type CanvasState = {
  tool: Tool;
  elements: Element[];
  history: Element[][]; // Para manejar el historial de acciones
  setTool: (tool: Tool) => void;
  addElement: (element: Element) => void;
  undo: () => void;
  redo: () => void;
};

export const useCanvasStore = create<CanvasState>((set) => ({
  tool: 'pencil',
  elements: [],
  history: [],
  setTool: (tool) => set({ tool }),
  addElement: (element) =>
    set((state) => {
      const newElements = [...state.elements, element];
      const newHistory = [...state.history, state.elements]; // Guardar el estado anterior
      return { elements: newElements, history: newHistory };
    }),
  undo: () =>
    set((state) => {
      if (state.history.length > 0) {
        const previousElements = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        return { elements: previousElements, history: newHistory };
      }
      return state;
    }),
  redo: () => {
    // Implementar lógica para "rehacer" si es necesario
  },
}));