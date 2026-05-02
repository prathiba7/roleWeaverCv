import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass rounded-xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);
