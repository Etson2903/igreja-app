import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Carregando...' }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      <p className="text-gray-500 mt-3 text-sm">{message}</p>
    </motion.div>
  );
}
