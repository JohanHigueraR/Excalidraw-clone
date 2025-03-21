import { useCanvasStore } from '@/store/canvasStore';
import { Element } from '@/types/types'; // Asegúrate de importar el tipo correcto

export const useCanvasEditor = (
  selectedElement: Element | null,
  selectedHandle: string | null,
  isSelecting: React.MutableRefObject<boolean>
) => {
  const { updateElement } = useCanvasStore();

  // Manejar el movimiento del mouse
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting.current || !selectedElement || !selectedHandle) return;
    const { offsetX, offsetY } = e.nativeEvent;

    switch (selectedHandle) {
      case 'top-left':
        selectedElement.data.width += selectedElement.data.x - offsetX;
        selectedElement.data.height += selectedElement.data.y - offsetY;
        selectedElement.data.x = offsetX;
        selectedElement.data.y = offsetY;
        break;
      case 'rotate':
        const centerX = selectedElement.data.x + selectedElement.data.width / 2;
        const centerY = selectedElement.data.y + selectedElement.data.height / 2;
        const angle = Math.atan2(offsetY - centerY, offsetX - centerX);
        selectedElement.data.rotation = angle;
        break;
      // Implementa los otros casos (top-right, bottom-left, bottom-right)
    }

    // Actualizar el elemento en el store
    updateElement(selectedElement.id, selectedElement.data);
  };

  return {
    onMouseMove,
  };
};