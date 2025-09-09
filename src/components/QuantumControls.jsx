import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, Play, Zap, Settings } from 'lucide-react';

const QuantumControls = ({ 
  nQ, 
  setNQ, 
  basisState, 
  setBasisState,
  gateType,
  setGateType,
  targetQ,
  setTargetQ,
  angleDeg,
  setAngleDeg,
  controlQ,
  setControlQ,
  targetQ2,
  setTargetQ2,
  swapA,
  setSwapA,
  swapB,
  setSwapB,
  cc_c1,
  setCc_c1,
  cc_c2,
  setCc_c2,
  cc_t,
  setCc_t,
  onSet,
  onAddGate,
  onUndo,
  onClearGates,
  onRun,
  onRunCircuit,
  afterSet,
  gateSequence
}) => {
  const [showAngle, setShowAngle] = useState(false);
  const [showCNOT, setShowCNOT] = useState(false);
  const [showSWAP, setShowSWAP] = useState(false);
  const [showCCNOT, setShowCCNOT] = useState(false);
  const [showSingleTarget, setShowSingleTarget] = useState(true);

  useEffect(() => {
    const type = gateType;
    setShowSingleTarget(['X','Y','Z','H','S','Sdg','T','Tdg','Rx','Ry','Rz','Phase','MEASURE'].includes(type));
    setShowAngle(['Rx','Ry','Rz','Phase'].includes(type));
    setShowCNOT(['CNOT', 'CZ'].includes(type));
    setShowSWAP(type === 'SWAP');
    setShowCCNOT(type === 'CCNOT');
  }, [gateType]);

  const populateBasisOptions = (n) => {
    const options = [];
    for (let i = 0; i < (1 << n); i++) {
      const binary = i.toString(2).padStart(n, '0');
      const display = binary.split('').map(bit => `|${bit}⟩`).join(' ⊗ ');
      options.push({ value: binary, display });
    }
    return options;
  };

  const populateQubitOptions = (n) => {
    return Array.from({ length: n }, (_, i) => ({ value: i, display: `q${i}` }));
  };

  return (
    <motion.div 
      className="space-y-6 p-6 glass-effect rounded-2xl shadow-xl"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-quantum-600 to-purple-600 bg-clip-text text-transparent">
          Quantum Controls
        </h2>
      </motion.div>

      {/* Number of Qubits */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Number of qubits (1 - 5):
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            min="1"
            max="5"
            value={nQ}
            onChange={(e) => setNQ(parseInt(e.target.value))}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
          />
          <motion.button
            onClick={onSet}
            className="px-6 py-2 bg-gradient-to-r from-quantum-500 to-purple-500 text-white rounded-lg font-medium hover:from-quantum-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Set
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Basis ordering is |q0 q1 … q(n-1)⟩, where q0 is the leftmost bit.
        </p>
      </motion.div>

      <AnimatePresence>
        {afterSet && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Initial Basis State */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Initial basis state:
              </label>
              <select
                value={basisState}
                onChange={(e) => setBasisState(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
              >
                {populateBasisOptions(nQ).map((option, idx) => (
                  <option key={idx} value={option.value}>
                    {option.display}
                  </option>
                ))}
              </select>
            </motion.div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Gate Selection */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Gate to add:
              </label>
              <select
                value={gateType}
                onChange={(e) => setGateType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
              >
                <optgroup label="Single-qubit (fixed)">
                  <option value="X">X (Pauli-X)</option>
                  <option value="Y">Y (Pauli-Y)</option>
                  <option value="Z">Z (Pauli-Z)</option>
                  <option value="H">H (Hadamard)</option>
                  <option value="S">S</option>
                  <option value="Sdg">S†</option>
                  <option value="T">T</option>
                  <option value="Tdg">T†</option>
                  <option value="MEASURE">MEASURE</option>
                </optgroup>
                <optgroup label="Single-qubit (parameterized)">
                  <option value="Rx">Rx(θ)</option>
                  <option value="Ry">Ry(θ)</option>
                  <option value="Rz">Rz(θ)</option>
                  <option value="Phase">Phase(φ)</option>
                </optgroup>
                <optgroup label="Two-qubit">
                  <option value="CNOT">CNOT (control,target)</option>
                  <option value="CZ">CZ (control,target)</option>
                  <option value="SWAP">SWAP (a,b)</option>
                </optgroup>
                <optgroup label="Three-qubit">
                  <option value="CCNOT">CCNOT / Toffoli (c1,c2; target)</option>
                </optgroup>
              </select>
            </motion.div>

            {/* Single Target */}
            <AnimatePresence>
              {showSingleTarget && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Target qubit:
                  </label>
                  <select
                    value={targetQ}
                    onChange={(e) => setTargetQ(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
                  >
                    {populateQubitOptions(nQ).map((option, idx) => (
                      <option key={idx} value={option.value}>
                        {option.display}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Angle Input */}
            <AnimatePresence>
              {showAngle && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {gateType === 'Phase' ? 'φ (degrees):' : 'θ (degrees):'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={angleDeg}
                    onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* CNOT/CZ Controls */}
            <AnimatePresence>
              {showCNOT && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Control qubit:
                      </label>
                      <select
                        value={controlQ}
                        onChange={(e) => setControlQ(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
                      >
                        {populateQubitOptions(nQ).map((option, idx) => (
                          <option key={idx} value={option.value}>
                            {option.display}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Target qubit:
                      </label>
                      <select
                        value={targetQ2}
                        onChange={(e) => setTargetQ2(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
                      >
                        {populateQubitOptions(nQ).map((option, idx) => (
                          <option key={idx} value={option.value}>
                            {option.display}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SWAP Controls */}
            <AnimatePresence>
              {showSWAP && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Qubit A:
                      </label>
                      <select
                        value={swapA}
                        onChange={(e) => setSwapA(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
                      >
                        {populateQubitOptions(nQ).map((option, idx) => (
                          <option key={idx} value={option.value}>
                            {option.display}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Qubit B:
                      </label>
                      <select
                        value={swapB}
                        onChange={(e) => setSwapB(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
                      >
                        {populateQubitOptions(nQ).map((option, idx) => (
                          <option key={idx} value={option.value}>
                            {option.display}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CCNOT Controls */}
            <AnimatePresence>
              {showCCNOT && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Control 1:
                      </label>
                      <select
                        value={cc_c1}
                        onChange={(e) => setCc_c1(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
                      >
                        {populateQubitOptions(nQ).map((option, idx) => (
                          <option key={idx} value={option.value}>
                            {option.display}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Control 2:
                      </label>
                      <select
                        value={cc_c2}
                        onChange={(e) => setCc_c2(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
                      >
                        {populateQubitOptions(nQ).map((option, idx) => (
                          <option key={idx} value={option.value}>
                            {option.display}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Target:
                      </label>
                      <select
                        value={cc_t}
                        onChange={(e) => setCc_t(parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-quantum-500 focus:border-transparent transition-all duration-200"
                      >
                        {populateQubitOptions(nQ).map((option, idx) => (
                          <option key={idx} value={option.value}>
                            {option.display}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={onAddGate}
                className="flex-1 min-w-[120px] px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Gate
              </motion.button>
              <motion.button
                onClick={onUndo}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Minus className="w-4 h-4 inline mr-2" />
                Undo
              </motion.button>
              <motion.button
                onClick={onClearGates}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Clear
              </motion.button>
            </motion.div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Run Buttons */}
            <motion.div 
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={onRun}
                className="flex-1 min-w-[140px] px-6 py-3 bg-gradient-to-r from-quantum-500 to-purple-500 text-white rounded-lg font-medium hover:from-quantum-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-5 h-5 inline mr-2" />
                Visualize
              </motion.button>
              <motion.button
                onClick={onRunCircuit}
                className="flex-1 min-w-[140px] px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Run Circuit
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuantumControls;