import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Circuit } from 'lucide-react';

const CircuitDiagram = ({ nQ, gateSequence }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    renderCircuit(nQ, gateSequence, containerRef.current);
  }, [nQ, gateSequence]);

  const renderCircuit = (numQubits, gates, container) => {
    const numClassical = numQubits;
    container.innerHTML = "";

    const width = Math.max(600, 120 * (gates.length + 1));
    const qheight = 60;
    const cHeight = 40;
    const height = numQubits * qheight + numClassical * cHeight + 60;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("class", "w-full h-auto");

    // Draw quantum wires
    for (let q = 0; q < numQubits; q++) {
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", 20);
      line.setAttribute("y1", 30 + q * qheight);
      line.setAttribute("x2", width - 20);
      line.setAttribute("y2", 30 + q * qheight);
      line.setAttribute("stroke", "currentColor");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("class", "text-gray-700 dark:text-gray-300");
      svg.appendChild(line);

      // Quantum labels
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", 0);
      text.setAttribute("y", 35 + q * qheight);
      text.setAttribute("class", "text-sm font-medium fill-current text-gray-700 dark:text-gray-300");
      text.textContent = `q${q}`;
      svg.appendChild(text);
    }

    const startY = numQubits * qheight + 50;
    // Draw classical registers
    for (let c = 0; c < numClassical; c++) {
      const y = startY + c * cHeight;
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", 20);
      line.setAttribute("y1", y);
      line.setAttribute("x2", width - 20);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "currentColor");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("class", "text-blue-500 dark:text-blue-400");
      svg.appendChild(line);

      // Classical labels
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", 0);
      text.setAttribute("y", y + 5);
      text.setAttribute("class", "text-sm font-medium fill-current text-blue-500 dark:text-blue-400");
      text.textContent = `cr[${c}]`;
      svg.appendChild(text);
    }

    // Draw gates
    gates.forEach((g, i) => {
      const x = 100 + i * 120;

      // Single-qubit gates
      if (["X", "Y", "Z", "H", "S", "T", "Sdg", "Tdg", "Rx", "Ry", "Rz", "Phase"].includes(g.type)) {
        const y = 30 + g.params[0] * qheight;

        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", x - 25);
        rect.setAttribute("y", y - 25);
        rect.setAttribute("width", 50);
        rect.setAttribute("height", 50);
        rect.setAttribute("fill", "currentColor");
        rect.setAttribute("stroke", "currentColor");
        rect.setAttribute("class", "text-green-100 dark:text-green-900 stroke-green-500 dark:stroke-green-400");
        svg.appendChild(rect);

        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "14");
        label.setAttribute("dominant-baseline", "middle");
        label.setAttribute("class", "font-semibold fill-current text-green-700 dark:text-green-300");

        if (["Rx", "Ry", "Rz", "Phase"].includes(g.type)) {
          const angleDeg = g.angle ? (g.angle * 180 / Math.PI).toFixed(1) : "";
          label.textContent = `${g.type}${angleDeg ? `(${angleDeg}°)` : ""}`;
        } else {
          label.textContent = g.type;
        }

        svg.appendChild(label);
      }

      // CNOT
      if (g.type === "CNOT") {
        const c = g.params[0];
        const t = g.params[1];
        const yc = 30 + c * qheight;
        const yt = 30 + t * qheight;

        const dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", yc);
        dot.setAttribute("r", 6);
        dot.setAttribute("fill", "currentColor");
        dot.setAttribute("class", "text-purple-600 dark:text-purple-400");
        svg.appendChild(dot);

        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", yt);
        circle.setAttribute("r", 12);
        circle.setAttribute("stroke", "currentColor");
        circle.setAttribute("fill", "currentColor");
        circle.setAttribute("class", "text-white dark:text-gray-900 stroke-purple-600 dark:stroke-purple-400");
        svg.appendChild(circle);

        const lineV = document.createElementNS(svgNS, "line");
        lineV.setAttribute("x1", x);
        lineV.setAttribute("y1", yc);
        lineV.setAttribute("x2", x);
        lineV.setAttribute("y2", yt);
        lineV.setAttribute("stroke", "currentColor");
        lineV.setAttribute("stroke-width", "2");
        lineV.setAttribute("class", "text-purple-600 dark:text-purple-400");
        svg.appendChild(lineV);

        const lineH = document.createElementNS(svgNS, "line");
        lineH.setAttribute("x1", x - 10);
        lineH.setAttribute("y1", yt);
        lineH.setAttribute("x2", x + 10);
        lineH.setAttribute("y2", yt);
        lineH.setAttribute("stroke", "currentColor");
        lineH.setAttribute("stroke-width", "2");
        lineH.setAttribute("class", "text-purple-600 dark:text-purple-400");
        svg.appendChild(lineH);

        const lineV2 = document.createElementNS(svgNS, "line");
        lineV2.setAttribute("x1", x);
        lineV2.setAttribute("y1", yt - 10);
        lineV2.setAttribute("x2", x);
        lineV2.setAttribute("y2", yt + 10);
        lineV2.setAttribute("stroke", "currentColor");
        lineV2.setAttribute("stroke-width", "2");
        lineV2.setAttribute("class", "text-purple-600 dark:text-purple-400");
        svg.appendChild(lineV2);
      }

      // CZ
      if (g.type === "CZ") {
        const c = g.params[0];
        const t = g.params[1];
        const yc = 30 + c * qheight;
        const yt = 30 + t * qheight;

        const dotC = document.createElementNS(svgNS, "circle");
        dotC.setAttribute("cx", x);
        dotC.setAttribute("cy", yc);
        dotC.setAttribute("r", 6);
        dotC.setAttribute("fill", "currentColor");
        dotC.setAttribute("class", "text-indigo-600 dark:text-indigo-400");
        svg.appendChild(dotC);

        const dotT = document.createElementNS(svgNS, "circle");
        dotT.setAttribute("cx", x);
        dotT.setAttribute("cy", yt);
        dotT.setAttribute("r", 6);
        dotT.setAttribute("fill", "currentColor");
        dotT.setAttribute("class", "text-indigo-600 dark:text-indigo-400");
        svg.appendChild(dotT);

        const lineV = document.createElementNS(svgNS, "line");
        lineV.setAttribute("x1", x);
        lineV.setAttribute("y1", yc);
        lineV.setAttribute("x2", x);
        lineV.setAttribute("y2", yt);
        lineV.setAttribute("stroke", "currentColor");
        lineV.setAttribute("stroke-width", "2");
        lineV.setAttribute("class", "text-indigo-600 dark:text-indigo-400");
        svg.appendChild(lineV);
      }

      // SWAP
      if (g.type === "SWAP") {
        const a = g.params[0];
        const b = g.params[1];
        const ya = 30 + a * qheight;
        const yb = 30 + b * qheight;

        const lines = [
          { x1: x - 10, y1: ya - 10, x2: x + 10, y2: ya + 10 },
          { x1: x - 10, y1: ya + 10, x2: x + 10, y2: ya - 10 },
          { x1: x - 10, y1: yb - 10, x2: x + 10, y2: yb + 10 },
          { x1: x - 10, y1: yb + 10, x2: x + 10, y2: yb - 10 },
          { x1: x, y1: ya, x2: x, y2: yb }
        ];

        lines.forEach(lineData => {
          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("x1", lineData.x1);
          line.setAttribute("y1", lineData.y1);
          line.setAttribute("x2", lineData.x2);
          line.setAttribute("y2", lineData.y2);
          line.setAttribute("stroke", "currentColor");
          line.setAttribute("stroke-width", "2");
          line.setAttribute("class", "text-orange-600 dark:text-orange-400");
          svg.appendChild(line);
        });
      }

      // CCNOT (Toffoli)
      if (g.type === "CCNOT") {
        const c1 = g.params[0];
        const c2 = g.params[1];
        const t = g.params[2];
        const y1 = 30 + c1 * qheight;
        const y2 = 30 + c2 * qheight;
        const yt = 30 + t * qheight;

        [y1, y2].forEach(yc => {
          const dot = document.createElementNS(svgNS, "circle");
          dot.setAttribute("cx", x);
          dot.setAttribute("cy", yc);
          dot.setAttribute("r", 6);
          dot.setAttribute("fill", "currentColor");
          dot.setAttribute("class", "text-red-600 dark:text-red-400");
          svg.appendChild(dot);
        });

        const lineV = document.createElementNS(svgNS, "line");
        lineV.setAttribute("x1", x);
        lineV.setAttribute("y1", Math.min(y1, y2));
        lineV.setAttribute("x2", x);
        lineV.setAttribute("y2", yt);
        lineV.setAttribute("stroke", "currentColor");
        lineV.setAttribute("stroke-width", "2");
        lineV.setAttribute("class", "text-red-600 dark:text-red-400");
        svg.appendChild(lineV);

        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", yt);
        circle.setAttribute("r", 12);
        circle.setAttribute("stroke", "currentColor");
        circle.setAttribute("fill", "currentColor");
        circle.setAttribute("class", "text-white dark:text-gray-900 stroke-red-600 dark:stroke-red-400");
        svg.appendChild(circle);

        const lineH = document.createElementNS(svgNS, "line");
        lineH.setAttribute("x1", x - 10);
        lineH.setAttribute("y1", yt);
        lineH.setAttribute("x2", x + 10);
        lineH.setAttribute("y2", yt);
        lineH.setAttribute("stroke", "currentColor");
        lineH.setAttribute("stroke-width", "2");
        lineH.setAttribute("class", "text-red-600 dark:text-red-400");
        svg.appendChild(lineH);

        const lineV2 = document.createElementNS(svgNS, "line");
        lineV2.setAttribute("x1", x);
        lineV2.setAttribute("y1", yt - 10);
        lineV2.setAttribute("x2", x);
        lineV2.setAttribute("y2", yt + 10);
        lineV2.setAttribute("stroke", "currentColor");
        lineV2.setAttribute("stroke-width", "2");
        lineV2.setAttribute("class", "text-red-600 dark:text-red-400");
        svg.appendChild(lineV2);
      }

      // MEASURE
      if (g.type === "MEASURE") {
        const q = g.params[0];
        const c = g.params[0];
        const yq = 30 + q * qheight;
        const yc = startY + c * cHeight;

        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", x - 20);
        rect.setAttribute("y", yq - 20);
        rect.setAttribute("width", 40);
        rect.setAttribute("height", 40);
        rect.setAttribute("fill", "currentColor");
        rect.setAttribute("stroke", "currentColor");
        rect.setAttribute("class", "text-yellow-100 dark:text-yellow-900 stroke-yellow-500 dark:stroke-yellow-400");
        svg.appendChild(rect);

        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", yq);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("dominant-baseline", "middle");
        label.setAttribute("font-size", "12");
        label.setAttribute("class", "font-semibold fill-current text-yellow-700 dark:text-yellow-300");
        label.textContent = "M";
        svg.appendChild(label);

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", yq + 20);
        line.setAttribute("x2", x);
        line.setAttribute("y2", yc);
        line.setAttribute("stroke", "currentColor");
        line.setAttribute("stroke-dasharray", "4");
        line.setAttribute("class", "text-blue-500 dark:text-blue-400");
        svg.appendChild(line);
      }

      // Identity gates for unaffected qubits
      for (let q = 0; q < numQubits; q++) {
        let isTarget = false;

        if (["X","Y","Z","H","S","T","Sdg","Tdg","Rx","Ry","Rz","Phase"].includes(g.type)) {
          isTarget = (q === g.params[0]);
        } else if (["CNOT", "CZ"].includes(g.type)) {
          isTarget = (q === g.params[0] || q === g.params[1]);
        } else if (g.type === "SWAP") {
          isTarget = (q === g.params[0] || q === g.params[1]);
        } else if (g.type === "CCNOT") {
          isTarget = (q === g.params[0] || q === g.params[1] || q === g.params[2]);
        } else if (g.type === "MEASURE") {
          isTarget = (q === g.params[0]);
        }

        if (!isTarget) {
          const y = 30 + q * qheight;
          const rect = document.createElementNS(svgNS, "rect");
          rect.setAttribute("x", x - 15);
          rect.setAttribute("y", y - 15);
          rect.setAttribute("width", 30);
          rect.setAttribute("height", 30);
          rect.setAttribute("fill", "currentColor");
          rect.setAttribute("stroke", "currentColor");
          rect.setAttribute("class", "text-gray-100 dark:text-gray-800 stroke-gray-400 dark:stroke-gray-600");
          svg.appendChild(rect);

          const label = document.createElementNS(svgNS, "text");
          label.setAttribute("x", x);
          label.setAttribute("y", y);
          label.setAttribute("text-anchor", "middle");
          label.setAttribute("dominant-baseline", "middle");
          label.setAttribute("font-size", "12");
          label.setAttribute("class", "font-medium fill-current text-gray-600 dark:text-gray-400");
          label.textContent = "I";
          svg.appendChild(label);
        }
      }
    });

    container.appendChild(svg);
  };

  return (
    <motion.div 
      className="p-6 glass-effect rounded-2xl shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex items-center mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Circuit className="w-6 h-6 mr-3 text-quantum-600 dark:text-quantum-400" />
        <h3 className="text-xl font-bold bg-gradient-to-r from-quantum-600 to-purple-600 bg-clip-text text-transparent">
          Circuit Diagram
        </h3>
      </motion.div>
      
      <div className="overflow-x-auto overflow-y-hidden">
        <div ref={containerRef} className="min-w-full" />
      </div>
    </motion.div>
  );
};

export default CircuitDiagram;