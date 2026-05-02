import { motion } from 'framer-motion';

interface KeywordBadgesProps {
  keywords: string[];
  total?: number;
}

export const KeywordBadges = ({ keywords, total }: KeywordBadgesProps) => {
  const score = total ? Math.round((keywords.length / total) * 100) : null;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4a5568]">Keywords Matched</p>
        {score !== null && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${score >= 70 ? 'bg-green-900/40 text-green-400' : score >= 40 ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'}`}>
            {score}% match
          </span>
        )}
      </div>

      {/* Score bar */}
      <div className="w-full h-1.5 bg-[#2a3347] rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score ?? 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${(score ?? 100) >= 70 ? 'bg-green-500' : (score ?? 100) >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {keywords.map((kw, i) => (
          <motion.span
            key={kw}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="px-2 py-0.5 text-xs rounded-full border border-brand-500/40 bg-brand-500/10 text-brand-300"
          >
            {kw}
          </motion.span>
        ))}
      </div>
    </div>
  );
};
