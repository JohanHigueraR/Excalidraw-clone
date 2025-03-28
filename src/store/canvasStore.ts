import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Element, ToolType, ViewState} from '../types/types';
import { devtools } from 'zustand/middleware';


type CanvasState = {
  tool: ToolType;
  elements: Element[];
  temporaryElements: Element[];
  selectedElements: Element[];
  history: Element[][]; // Para manejar el historial de acciones
  zoom: number;
  offset: { x: number; y: number };
  setZoom: (zoom: number) => void;
  setOffset: (offset: { x: number; y: number }) => void;
  setTool: (tool: ToolType) => void;
  setSelectedElements: (elements: Element[]) => void;
  clearSelectedElements: () => void;
  setTemporaryElements: (elements: Element[]) => void;
  clearTemporaryElements: () => void;
  addElement: (element: Omit<Element, 'id'>) => void; // No necesitas pasar el ID manualmente
  updateElement: (id: string, data: any) => void; // Actualizar un elemento existente
  deleteElement: (id: string) => void; // Eliminar un elemento existente
  undo: () => void;
  redo: () => void;
};

export const useCanvasStore = create<CanvasState>()(devtools((set) => ({
  tool: 'pencil',
  temporaryElements: [],
  clearTemporaryElements: () => set({ temporaryElements: [] }),
  setTemporaryElements: (elements) => set({ temporaryElements: elements }),
  clearSelectedElements: () => set({ selectedElements: [] }),
  elements: [],
  history: [],
  selectedElements: [],
  zoom: 100,
  offset: { x: 0, y: 0 },
  setZoom: (zoom) => set({ zoom }),
  setOffset: (offset) => set({ offset }),
  setTool: (tool) => set({ tool }),
  setSelectedElements: (elements) => set({ selectedElements: elements }),

  // Agregar un nuevo elemento con un ID único
  addElement: (element) =>
    set((state) => {
      const newElement = { ...element, id: uuidv4() }; // Generar un ID único
      const newElements = [...state.elements, newElement];
      const newHistory = [...state.history, state.elements]; // Guardar el estado anterior
      return { elements: newElements, history: newHistory };
    }),

  // Actualizar un elemento existente
  updateElement: (id, data) =>
    set((state) => {
      const updatedElements = state.elements.map((element) =>
        element.id === id ? data : element
      );
      return { elements: updatedElements };
    }),

  // Eliminar un elemento existente
  deleteElement: (id) =>
    set((state) => {
      const updatedElements = state.elements.filter((element) => element.id !== id);
      return { elements: updatedElements };
    }),

  // Deshacer la última acción
  undo: () =>
    set((state) => {
      if (state.history.length > 0) {
        const previousElements = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        return { elements: previousElements, history: newHistory };
      }
      return state;
    }),

  // Rehacer la última acción (pendiente de implementar)
  redo: () => {
    // Implementar lógica para "rehacer" si es necesario
  },
})));