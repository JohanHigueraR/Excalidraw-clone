"use client";
import { useCanvasStore } from "@/store/canvasStore";
import { Tool } from "@/types/types"
import { Pencil, Square, Circle, Eraser, ArrowUpRight, Text, MousePointer, Minus } from "lucide-react";

const tools: { name: Tool; icon: any; label: string }[] = [
  { name: "select", icon: MousePointer, label: "Seleccionar" },
  { name: "pencil", icon: Pencil, label: "Lápiz" },
  { name: "rectangle", icon: Square, label: "Rectángulo" },
  { name: "circle", icon: Circle, label: "Círculo" },
  { name: "arrow", icon: ArrowUpRight, label: "Flecha" },
  { name: "line", icon: Minus, label: "Línea" },
  { name: "eraser", icon: Eraser, label: "Borrador" },
  { name: "text", icon: Text, label: "Texto" },
];

const TopToolbar = () => {
  const { selectedTool, setSelectedTool } = useCanvasStore();

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 bg-white shadow-md flex gap-2 p-2 rounded-lg">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => setSelectedTool(tool.name)}
          className={`p-2 rounded-lg transition ${selectedTool === tool.name ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          title={tool.label}
        >
          <tool.icon size={20} />
        </button>
      ))}
    </div>
  );
};

export default TopToolbar;
