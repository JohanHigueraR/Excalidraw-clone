export const getSvgPathFromStroke = (stroke: number[][]) => {
    if (!stroke.length) return "";
  
    const d = stroke
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" ");
  
    return `${d} Z`; // Cerrar el path
  };
  