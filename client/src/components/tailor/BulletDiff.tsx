import { motion } from 'framer-motion';
import type { ParsedResume } from '../../types';
import { ArrowRight } from 'lucide-react';

interface BulletDiffProps {
  original: ParsedResume;
  tailored: ParsedResume;
}

export const BulletDiff = ({ original, tailored }: BulletDiffProps) => (
  <div className="space-y-6">
    {(original.experience || []).map((exp, i) => {
      const tailoredExp = tailored.experience[i];
      if (!tailoredExp) return null;
      return (
        <div key={i} className="glass rounded-xl p-5">
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-3">
            {exp.company} · {exp.title}
          </p>
          <div className="space-y-3">
            {exp.bullets.map((bullet, j) => {
              const newBullet = tailoredExp.bullets[j];
              const changed = newBullet && newBullet.text !== bullet.text;
              return (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: j * 0.05 }}
                  className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start"
                >
                  <div className={`text-xs p-2.5 rounded-lg ${changed ? 'bg-red-900/20 border border-red-800/40 text-red-300' : 'bg-[#161b27] border border-[#2a3347] text-[#8b949e]'}`}>
                    {bullet.text}
                  </div>
                  <ArrowRight className={`w-4 h-4 mt-2 shrink-0 ${changed ? 'text-brand-400' : 'text-[#2a3347]'}`} />
                  <div className={`text-xs p-2.5 rounded-lg ${changed ? 'bg-green-900/20 border border-green-800/40 text-green-300' : 'bg-[#161b27] border border-[#2a3347] text-[#8b949e]'}`}>
                    {newBullet?.text || bullet.text}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);
