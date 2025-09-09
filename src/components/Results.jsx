import { motion } from 'framer-motion';
import { BarChart3, Database, Activity } from 'lucide-react';

const Results = ({ results, backendResults, loading }) => {
  if (loading) {
    return (
      <motion.div 
        className="p-8 glass-effect rounded-2xl shadow-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="loading-spinner mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Processing quantum circuit...</p>
      </motion.div>
    );
  }

  if (!results && !backendResults) {
    return (
      <motion.div 
        className="p-8 glass-effect rounded-2xl shadow-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Activity className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Initial state set. Add gates and click Run to see results.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {results && (
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
            <BarChart3 className="w-6 h-6 mr-3 text-quantum-600 dark:text-quantum-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-quantum-600 to-purple-600 bg-clip-text text-transparent">
              Quantum State Results
            </h3>
          </motion.div>
          
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: results }}
          />
        </motion.div>
      )}

      {backendResults && (
        <motion.div 
          className="p-6 glass-effect rounded-2xl shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="flex items-center mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Database className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Backend Results
            </h3>
          </motion.div>
          
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {backendResults}
          </pre>
        </motion.div>
      )}
    </div>
  );
};

export default Results;