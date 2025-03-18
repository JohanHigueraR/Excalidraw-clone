import { create } from 'zustand';
import { ToolType } from '@/types/types';



interface ToolsState {
  selectedTool: ToolType;
  strokeWidth: number;
  strokeColor: string;
  setSelectedTool: (tool: ToolType) => void;
  setStrokeWidth: (width: number) => void;
  setStrokeColor: (color: string) => void;
}

export const useToolsStore = create<ToolsState>((set) => ({
  selectedTool: 'pencil',
  strokeWidth: 2,
  strokeColor: '#000000',
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setStrokeColor: (color) => set({ strokeColor: color }),
}));
