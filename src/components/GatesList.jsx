import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Trash2, Layers } from 'lucide-react';

const GatesList = ({ gateSequence, onMoveUp, onMoveDown, onRemove }) => {
  if (gateSequence.length === 0) {
    return (
      <motion.div 
        className="p-6 glass-effect rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <Layers className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No gates added yet.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="p-6 glass-effect rounded-2xl shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-xl font-bold mb-4 bg-gradient-to-r from-quantum-600 to-purple-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Gate Sequence ({gateSequence.length})
      </motion.h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {gateSequence.map((gate, index) => (
            <motion.div
              key={`${gate.type}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
            >
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {index + 1}. {gate.type}
                  {gate.params?.length > 0 && ` (${gate.params.join(',')})`}
                  {gate.angle !== undefined && `, ${(gate.angle * 180 / Math.PI).toFixed(2)}°`}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <motion.button
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 rounded text-gray-500 hover:text-quantum-600 hover:bg-quantum-50 dark:hover:bg-quantum-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronUp className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={() => onMoveDown(index)}
                  disabled={index === gateSequence.length - 1}
                  className="p-1 rounded text-gray-500 hover:text-quantum-600 hover:bg-quantum-50 dark:hover:bg-quantum-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  onClick={() => onRemove(index)}
                  className="p-1 rounded text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GatesList;