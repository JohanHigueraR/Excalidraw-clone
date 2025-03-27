// useQuadtree.ts
import { useEffect, useRef, useState } from "react";
import { Element } from "@/types/types";
import { useCanvasStore } from "@/store/canvasStore";
import { Boundary } from "@/types/types";


// Función para verificar si dos boundaries se intersectan
const boundariesIntersect = (a: Boundary, b: Boundary): boolean => {
  return !(
    a.x > b.x + b.width ||
    a.x + a.width < b.x ||
    a.y > b.y + b.height ||
    a.y + a.height < b.y
  );
};

// Función para verificar si un elemento intersecta un boundary
const elementIntersectsBoundary = (boundary: Boundary, element: Element): boolean => {
  const elemBounds = {
    x: element.points.x,
    y: element.points.y,
    width: element.points.width,
    height: element.points.height
  };
  return boundariesIntersect(boundary, elemBounds);
};

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
      { x: x + halfWidth, y, width: halfWidth, height: halfHeight },
      this.capacity
    );
    this.northwest = new Quadtree(
      { x, y, width: halfWidth, height: halfHeight },
      this.capacity
    );
    this.southeast = new Quadtree(
      { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight },
      this.capacity
    );
    this.southwest = new Quadtree(
      { x, y: y + halfHeight, width: halfWidth, height: halfHeight },
      this.capacity
    );

    this.divided = true;
  }

  insert(element: Element): boolean {
    if (!elementIntersectsBoundary(this.boundary, element)) {
      return false;
    }

    if (this.elements.length < this.capacity) {
      this.elements.push(element);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    let insertedAnywhere = false;
    insertedAnywhere = this.northeast!.insert(element) || insertedAnywhere;
    insertedAnywhere = this.northwest!.insert(element) || insertedAnywhere;
    insertedAnywhere = this.southeast!.insert(element) || insertedAnywhere;
    insertedAnywhere = this.southwest!.insert(element) || insertedAnywhere;

    if (!insertedAnywhere) {
      this.elements.push(element);
    }

    return true;
  }

  query(range: Boundary, found: Element[] = []): Element[] {
    if (!boundariesIntersect(this.boundary, range)) {
      return found;
    }

    for (const element of this.elements) {
      if (elementIntersectsBoundary(range, element)) {
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

  clear() {
    this.elements = [];
    this.divided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  }
}

export const useQuadtree = () => {
  const { elements } = useCanvasStore();
  const quadtreeRef = useRef<Quadtree | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!quadtreeRef.current) {
      quadtreeRef.current = new Quadtree({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      });
    } else {
      quadtreeRef.current.clear();
    }

    elements.forEach(element => {
      quadtreeRef.current!.insert(element);
    });

    setVersion(v => v + 1);
  }, [elements]);

  useEffect(() => {
    const handleResize = () => {
      if (quadtreeRef.current) {
        quadtreeRef.current = new Quadtree({
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        });

        elements.forEach(element => {
          quadtreeRef.current!.insert(element);
        });

        setVersion(v => v + 1);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [elements]);

  return quadtreeRef;
};