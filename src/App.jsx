import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from './components/AnimatedBackground';
import ThemeToggle from './components/ThemeToggle';
import QuantumControls from './components/QuantumControls';
import GatesList from './components/GatesList';
import CircuitDiagram from './components/CircuitDiagram';
import BlochSpheres from './components/BlochSpheres';
import Results from './components/Results';
import { useQuantumLogic } from './hooks/useQuantumLogic';
import { displayResults } from './utils/formatters';

function App() {
  // State management
  const [nQ, setNQ] = useState(2);
  const [basisState, setBasisState] = useState('00');
  const [afterSet, setAfterSet] = useState(false);
  
  // Gate controls
  const [gateType, setGateType] = useState('X');
  const [targetQ, setTargetQ] = useState(0);
  const [angleDeg, setAngleDeg] = useState(90);
  const [controlQ, setControlQ] = useState(0);
  const [targetQ2, setTargetQ2] = useState(1);
  const [swapA, setSwapA] = useState(0);
  const [swapB, setSwapB] = useState(1);
  const [cc_c1, setCc_c1] = useState(0);
  const [cc_c2, setCc_c2] = useState(1);
  const [cc_t, setCc_t] = useState(2);
  
  // Results
  const [results, setResults] = useState('');
  const [backendResults, setBackendResults] = useState('');
  const [reducedList, setReducedList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { gateSequence, setGateSequence, runSimulation } = useQuantumLogic();

  // Initialize MathJax
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, [results]);

  const onSet = () => {
    if (!(nQ >= 1 && nQ <= 5)) {
      alert("Choose n between 1 and 5");
      return;
    }
    
    // Reset basis state to all zeros
    const newBasisState = '0'.repeat(nQ);
    setBasisState(newBasisState);
    
    setAfterSet(true);
    setGateSequence([]);
    setResults("<div class='text-sm text-gray-600 dark:text-gray-400'>Initial state set. Add gates and click Run.</div>");
    setBackendResults('');
    setReducedList([]);
  };

  const validateGate = (gate) => {
    const { type, params } = gate;
    
    if (['CNOT', 'CZ'].includes(type)) {
      if (params[0] === params[1]) {
        alert("Control and target must be different");
        return false;
      }
    } else if (type === 'SWAP') {
      if (params[0] === params[1]) {
        alert("Choose two different qubits");
        return false;
      }
    } else if (type === 'CCNOT') {
      const set = new Set(params);
      if (set.size < 3) {
        alert("Controls and target must be all different");
        return false;
      }
      if (nQ < 3) {
        alert("CCNOT needs at least 3 qubits");
        return false;
      }
    }
    
    return true;
  };

  const onAddGate = () => {
    let gate = { type: gateType, params: [] };

    if (['X','Y','Z','H','S','Sdg','T','Tdg','Rx','Ry','Rz','Phase','MEASURE'].includes(gateType)) {
      gate.params = [targetQ];
      if (['Rx','Ry','Rz','Phase'].includes(gateType)) {
        gate.angle = (angleDeg || 0) * Math.PI / 180;
      }
    } else if (['CNOT', 'CZ'].includes(gateType)) {
      gate.params = [controlQ, targetQ2];
    } else if (gateType === 'SWAP') {
      gate.params = [swapA, swapB];
    } else if (gateType === 'CCNOT') {
      gate.params = [cc_c1, cc_c2, cc_t];
    }

    if (!validateGate(gate)) return;

    setGateSequence(prev => [...prev, gate]);
  };

  const onUndo = () => {
    setGateSequence(prev => prev.slice(0, -1));
    setResults('');
    setBackendResults('');
    setReducedList([]);
  };

  const onClearGates = () => {
    setGateSequence([]);
    setResults('');
    setBackendResults('');
    setReducedList([]);
  };

  const onRun = () => {
    setLoading(true);
    
    try {
      const { stateVec, rho, reducedList: newReducedList, measurementResults } = runSimulation(nQ, basisState, gateSequence);
      
      const resultsHTML = displayResults(stateVec, rho, newReducedList, measurementResults);
      setResults(resultsHTML);
      setReducedList(newReducedList);
      
      // Trigger MathJax rendering
      setTimeout(() => {
        if (window.MathJax) {
          window.MathJax.typesetPromise();
        }
      }, 100);
    } catch (error) {
      console.error('Simulation error:', error);
      setResults(`<div class="text-red-600 dark:text-red-400">Error running simulation: ${error.message}</div>`);
    } finally {
      setLoading(false);
    }
  };

  const onRunCircuit = async () => {
    setLoading(true);
    
    const payload = {
      numQubits: nQ,
      gates: gateSequence
    };

    try {
      const res = await fetch("https://qsv-3xax.onrender.com/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setBackendResults(
        "Backend Counts:\n" + JSON.stringify(data.counts, null, 2) +
        "\n\nQASM:\n" + data.qasm
      );
    } catch (err) {
      console.error(err);
      setBackendResults("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const onMoveUp = (index) => {
    if (index > 0) {
      const newSequence = [...gateSequence];
      [newSequence[index - 1], newSequence[index]] = [newSequence[index], newSequence[index - 1]];
      setGateSequence(newSequence);
      setResults('');
      setBackendResults('');
      setReducedList([]);
    }
  };

  const onMoveDown = (index) => {
    if (index < gateSequence.length - 1) {
      const newSequence = [...gateSequence];
      [newSequence[index + 1], newSequence[index]] = [newSequence[index], newSequence[index + 1]];
      setGateSequence(newSequence);
      setResults('');
      setBackendResults('');
      setReducedList([]);
    }
  };

  const onRemove = (index) => {
    const newSequence = gateSequence.filter((_, i) => i !== index);
    setGateSequence(newSequence);
    setResults('');
    setBackendResults('');
    setReducedList([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-colors duration-300">
      <AnimatedBackground />
      <ThemeToggle />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-quantum-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          >
            Quantum Bloch Sphere Visualizer
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Explore quantum states and gates with interactive 3D Bloch sphere visualization
          </motion.p>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="xl:col-span-1 space-y-6">
            <QuantumControls
              nQ={nQ}
              setNQ={setNQ}
              basisState={basisState}
              setBasisState={setBasisState}
              gateType={gateType}
              setGateType={setGateType}
              targetQ={targetQ}
              setTargetQ={setTargetQ}
              angleDeg={angleDeg}
              setAngleDeg={setAngleDeg}
              controlQ={controlQ}
              setControlQ={setControlQ}
              targetQ2={targetQ2}
              setTargetQ2={setTargetQ2}
              swapA={swapA}
              setSwapA={setSwapA}
              swapB={swapB}
              setSwapB={setSwapB}
              cc_c1={cc_c1}
              setCc_c1={setCc_c1}
              cc_c2={cc_c2}
              setCc_c2={setCc_c2}
              cc_t={cc_t}
              setCc_t={setCc_t}
              onSet={onSet}
              onAddGate={onAddGate}
              onUndo={onUndo}
              onClearGates={onClearGates}
              onRun={onRun}
              onRunCircuit={onRunCircuit}
              afterSet={afterSet}
              gateSequence={gateSequence}
            />
            
            <GatesList
              gateSequence={gateSequence}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onRemove={onRemove}
            />
          </div>

          {/* Right Column - Visualizations */}
          <div className="xl:col-span-2 space-y-6">
            <CircuitDiagram nQ={nQ} gateSequence={gateSequence} />
            
            <Results 
              results={results} 
              backendResults={backendResults} 
              loading={loading}
            />
            
            <BlochSpheres reducedList={reducedList} nQ={nQ} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;