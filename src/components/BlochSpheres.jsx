import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Plotly from 'plotly.js-dist-min';
import { Atom } from 'lucide-react';

const BlochSpheres = ({ reducedList, nQ }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !reducedList || reducedList.length === 0) return;
    
    drawAllBloch(reducedList, containerRef.current);
  }, [reducedList, nQ]);

  const densityToBloch = (red) => {
    const rho01 = red[0][1];
    const x = 2 * rho01.re;
    const y = -2 * rho01.im;
    const z = red[0][0].re - red[1][1].re;
    return { x, y, z };
  };

  const qubitEntropy = (x, y, z) => {
    const r = Math.sqrt(x * x + y * y + z * z);
    const lambda1 = (1 + r) / 2;
    const lambda2 = (1 - r) / 2;
    
    function log2Safe(val) {
      return val > 0 ? Math.log(val) / Math.log(2) : 0;
    }
    
    const S = -(lambda1 * log2Safe(lambda1) + lambda2 * log2Safe(lambda2));
    return S;
  };

  const drawAllBloch = (reducedList, container) => {
    container.innerHTML = '';

    if (reducedList.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'text-center p-8';
      emptyDiv.innerHTML = `
        <div class="text-gray-400 dark:text-gray-600 mb-3">
          <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2L3 7v11h14V7l-7-5z"/>
          </svg>
        </div>
        <p class="text-gray-500 dark:text-gray-400">Run the visualization to see Bloch spheres</p>
      `;
      container.appendChild(emptyDiv);
      return;
    }

    for (let q = 0; q < reducedList.length; q++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex flex-col lg:flex-row items-center gap-6 p-6 glass-effect rounded-2xl shadow-xl mb-6';

      const sphereDiv = document.createElement('div');
      sphereDiv.id = 'bloch_' + q;
      sphereDiv.className = 'w-full lg:w-1/2 h-80';
      wrapper.appendChild(sphereDiv);

      const propsDiv = document.createElement('div');
      propsDiv.className = 'w-full lg:w-1/2 space-y-4';
      
      const bloch = densityToBloch(reducedList[q]);
      const x = bloch.x;
      const y = bloch.y;
      const z = bloch.z;
      const entropy = qubitEntropy(x, y, z);
      const purity = (1 + x * x + y * y + z * z) / 2;
      
      propsDiv.innerHTML = `
        <div class="text-center lg:text-left">
          <h3 class="text-2xl font-bold bg-gradient-to-r from-quantum-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Qubit ${q}
          </h3>
          <div class="space-y-3 text-sm">
            <div class="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span class="font-semibold text-gray-700 dark:text-gray-300">Bloch Vector:</span>
              <div class="text-gray-600 dark:text-gray-400 font-mono">
                (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})
              </div>
            </div>
            <div class="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span class="font-semibold text-gray-700 dark:text-gray-300">Entropy (mixedness):</span>
              <div class="text-gray-600 dark:text-gray-400 font-mono">${entropy.toFixed(3)}</div>
            </div>
            <div class="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span class="font-semibold text-gray-700 dark:text-gray-300">Purity:</span>
              <div class="text-gray-600 dark:text-gray-400 font-mono">${purity.toFixed(3)}</div>
            </div>
            <div class="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <span class="font-semibold text-gray-700 dark:text-gray-300">Measurement probabilities:</span>
              <div class="text-gray-600 dark:text-gray-400 font-mono">
                |0⟩: ${reducedList[q][0][0].re.toFixed(3)}<br>
                |1⟩: ${reducedList[q][1][1].re.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      `;
      
      wrapper.appendChild(propsDiv);
      container.appendChild(wrapper);

      const r = Math.sqrt(bloch.x**2 + bloch.y**2 + bloch.z**2);
      plotBloch(sphereDiv.id, bloch, q, r < 1e-6);
    }
  };

  const plotBloch = (containerId, bloch, q, isMixed) => {
    const U = 30, V = 30;
    let xs = [], ys = [], zs = [];

    for (let i = 0; i <= U; i++) {
      const rowx = [], rowy = [], rowz = [];
      const theta = Math.PI * i / U;
      for (let j = 0; j <= V; j++) {
        const phi = 2 * Math.PI * j / V;
        rowx.push(Math.sin(theta) * Math.cos(phi));
        rowy.push(Math.sin(theta) * Math.sin(phi));
        rowz.push(Math.cos(theta));
      }
      xs.push(rowx); ys.push(rowy); zs.push(rowz);
    }

    const sphere = {
      type: 'surface',
      x: xs, y: ys, z: zs,
      opacity: 0.3,
      colorscale: [[0, 'rgba(99, 102, 241, 0.1)'], [1, 'rgba(147, 51, 234, 0.2)']],
      showscale: false,
      contours: {
        x: { show: true, color: "#6366f1", width: 1 },
        y: { show: true, color: "#6366f1", width: 1 },
        z: { show: true, color: "#6366f1", width: 1 }
      },
      hoverinfo: 'skip'
    };

    const axes = [
      { type: 'scatter3d', mode: 'lines', x: [-1, 1], y: [0, 0], z: [0, 0], line: { width: 3, color: '#8b5cf6' }, name: "x-axis" },
      { type: 'scatter3d', mode: 'lines', x: [0, 0], y: [-1, 1], z: [0, 0], line: { width: 3, color: '#8b5cf6' }, name: "y-axis" },
      { type: 'scatter3d', mode: 'lines', x: [0, 0], y: [0, 0], z: [-1, 1], line: { width: 3, color: '#8b5cf6' }, name: "z-axis" }
    ];

    const labels = {
      type: 'scatter3d',
      mode: 'text',
      x: [0, 0, 1.3, -1.3, 0, 0],
      y: [0, 0, 0, 0, 1.3, -1.3],
      z: [1.3, -1.3, 0, 0, 0, 0],
      text: ['|0⟩', '|1⟩', '|+⟩', '|−⟩', '|+i⟩', '|−i⟩'],
      textfont: { size: 13, color: '#6366f1' },
      textposition: 'middle center',
      hoverinfo: 'text'
    };

    let traces = [sphere, ...axes, labels];

    if (isMixed) {
      traces.push({
        type: 'scatter3d',
        mode: 'markers',
        x: [0], y: [0], z: [0],
        marker: { size: 8, color: '#ef4444' },
        name: 'mixed state'
      });
    } else {
      const vx = bloch.x, vy = bloch.y, vz = bloch.z;
      
      const stateVector = {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: [0, vx], y: [0, vy], z: [0, vz],
        line: { width: 6, color: '#f59e0b' },
        marker: { size: 2, color: '#f59e0b' },
        hoverinfo: 'x+y+z',
        name: "qubit state"
      };

      const arrowHead = {
        type: 'cone',
        x: [vx], y: [vy], z: [vz],
        u: [vx], v: [vy], w: [vz],
        sizemode: 'absolute',
        sizeref: 0.2,
        anchor: 'tip',
        colorscale: [[0, '#f59e0b'], [1, '#f59e0b']],
        showscale: false
      };

      traces.push(stateVector, arrowHead);
    }

    const layout = {
      title: {
        text: `Qubit ${q}`,
        font: { size: 16, color: '#6366f1' }
      },
      margin: { l: 0, r: 0, b: 0, t: 40 },
      scene: {
        aspectmode: 'cube',
        xaxis: { range: [-1.3, 1.3], showgrid: false, zeroline: false, showticklabels: false, visible: false },
        yaxis: { range: [-1.3, 1.3], showgrid: false, zeroline: false, showticklabels: false, visible: false },
        zaxis: { range: [-1.3, 1.3], showgrid: false, zeroline: false, showticklabels: false, visible: false },
        camera: { eye: { x: 1.2, y: 1.2, z: 1.2 } },
        bgcolor: 'rgba(0,0,0,0)'
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: false
    };

    Plotly.newPlot(containerId, traces, layout, { displayModeBar: false, responsive: true });
  };

  if (!reducedList || reducedList.length === 0) {
    return (
      <motion.div 
        className="p-8 glass-effect rounded-2xl shadow-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Atom className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          The fundamental unit of quantum information, serving as the quantum equivalent of a classical computer's bit. 
          A qubit can have states |0⟩, |1⟩, or superposition.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-quantum-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Bloch Sphere Visualization
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Tensor products (⊗) are essential for describing subsystems composed of multiple quantum subsystems, 
          where the state of the total system is given by the tensor product of the states of the individual subsystems.
        </p>
      </motion.div>
      <div ref={containerRef} />
    </motion.div>
  );
};

export default BlochSpheres;