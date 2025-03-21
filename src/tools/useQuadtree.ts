import { useEffect, useRef, useState } from 'react';
import { Element } from '@/types/types'; // Asegúrate de importar el tipo Element

// Definir el tipo Boundary para el Quadtree
type Boundary = {
  x: number;
  y: number;
  width: number;
  height: number;
  contains: (element: Element) => boolean;
  intersects: (range: Boundary) => boolean;
};

// Clase Quadtree
export class Quadtree {
  boundary: Boundary;
  capacity: number;
  elements: Element[];
  divided: boolean;
  northeast: Quadtree | null;
  northwest: Quadtree | null;
  southeast: Quadtree | null;
  southwest: Quadtree | null;

  constructor(boundary: Boundary, capacity: number = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.elements = [];
    this.divided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  }

  subdivide() {
    const { x, y, width, height } = this.boundary;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.northeast = new Quadtree(
      {
        x: x + halfWidth,
        y,
        width: halfWidth,
        height: halfHeight,
        contains: this.boundary.contains,
        intersects: this.boundary.intersects,
      },
      this.capacity
    );
    this.northwest = new Quadtree(
      {
        x,
        y,
        width: halfWidth,
        height: halfHeight,
        contains: this.boundary.contains,
        intersects: this.boundary.intersects,
      },
      this.capacity
    );
    this.southeast = new Quadtree(
      {
        x: x + halfWidth,
        y: y + halfHeight,
        width: halfWidth,
        height: halfHeight,
        contains: this.boundary.contains,
        intersects: this.boundary.intersects,
      },
      this.capacity
    );
    this.southwest = new Quadtree(
      {
        x,
        y: y + halfHeight,
        width: halfWidth,
        height: halfHeight,
        contains: this.boundary.contains,
        intersects: this.boundary.intersects,
      },
      this.capacity
    );

    this.divided = true;
    
  }

  insert(element: Element): boolean {
    if (!this.boundary.contains(element)) {
      return false;
    }

    if (this.elements.length < this.capacity) {
      this.elements.push(element);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    
    return (
      this.northeast!.insert(element) ||
      this.northwest!.insert(element) ||
      this.southeast!.insert(element) ||
      this.southwest!.insert(element)
    );
  }

  query(range: Boundary, found: Element[] = []): Element[] {
    if (!this.boundary.intersects(range)) {
      return found;
    }

    for (const element of this.elements) {
      if (range.contains(element)) {
        found.push(element);
      }
    }

    if (this.divided) {
      this.northeast!.query(range, found);
      this.northwest!.query(range, found);
      this.southeast!.query(range, found);
      this.southwest!.query(range, found);
    }

    return found;
  }

  // Método para imprimir la estructura del Quadtree
  
}

// Hook useQuadtree
export const useQuadtree = (elements: Element[]) => {
  const quadtreeRef = useRef<Quadtree | null>(null);
  const [previousElements, setPreviousElements] = useState<Element[]>([]);

  useEffect(() => {
    const boundary: Boundary = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      contains: (element: Element) => { 
          const { x, y, width, height } = element.points;
          return (
            x + width >= boundary.x &&
            x <= boundary.x + boundary.width &&
            y + height >= boundary.y &&
            y <= boundary.y + boundary.height
          );
      },
      intersects: (range: Boundary) => {
        return !(
          range.x > boundary.x + boundary.width ||
          range.x + range.width < boundary.x ||
          range.y > boundary.y + boundary.height ||
          range.y + range.height < boundary.y
        );
      },
    };

    // Inicializar el Quadtree si no existe
    if (!quadtreeRef.current) {
      quadtreeRef.current = new Quadtree(boundary);
    }

    // Encontrar los nuevos elementos que no estaban en el Quadtree
    const newElements = elements.filter(
      (element) => !previousElements.includes(element)
    );

    // Insertar solo los nuevos elementos
    newElements.forEach((element) => quadtreeRef.current!.insert(element));

    // Actualizar el estado de los elementos anteriores
    setPreviousElements(elements);

  }, [elements]); // Dependencia: elements

  return quadtreeRef;
};