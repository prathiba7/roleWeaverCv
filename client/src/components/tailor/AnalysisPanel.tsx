import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ATSAnalysis } from '../../types';
import { AlertTriangle, Target, Lightbulb, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: ATSAnalysis;
}

const Section = ({ icon: Icon, title, color, children }: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-semibold text-[#e6edf3]">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#4a5568]" /> : <ChevronDown className="w-4 h-4 text-[#4a5568]" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-[#2a3347]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AnalysisPanel = ({ analysis }: AnalysisPanelProps) => {
  const scoreColor = analysis.atsScore >= 70 ? 'text-green-400' : analysis.atsScore >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      {/* ATS Score */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4a5568]">ATS Match Score</p>
          <span className={`text-2xl font-bold ${scoreColor}`}>{analysis.atsScore}<span className="text-sm font-normal">/100</span></span>
        </div>
        <div className="w-full h-2 bg-[#2a3347] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analysis.atsScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${analysis.atsScore >= 70 ? 'bg-green-500' : analysis.atsScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
          />
        </div>
      </div>

      {/* Critique */}
      <Section icon={AlertTriangle} title="Hiring Manager's Honest Critique" color="text-red-400">
        <div className="mt-3 text-xs text-[#8b949e] leading-relaxed whitespace-pre-wrap">
          {analysis.critique}
        </div>
      </Section>

      {/* Missing Keywords */}
      {analysis.missingKeywords?.length > 0 && (
        <Section icon={Target} title="Missing Keywords (Add These)" color="text-yellow-400">
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.missingKeywords.map((kw, i) => (
              <motion.span
                key={kw}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="px-2 py-1 text-xs rounded-full border border-yellow-700/50 bg-yellow-900/20 text-yellow-300"
              >
                {kw}
              </motion.span>
            ))}
          </div>
        </Section>
      )}

      {/* Weak Skills */}
      {analysis.weaklyHighlightedSkills?.length > 0 && (
        <Section icon={Lightbulb} title="Skills to Highlight More" color="text-brand-400">
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.weaklyHighlightedSkills.map((skill, i) => (
              <span key={i} className="px-2 py-1 text-xs rounded-full border border-brand-500/40 bg-brand-500/10 text-brand-300">
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Restructuring Advice */}
      {analysis.restructuringAdvice && (
        <Section icon={CheckCircle} title="ATS Restructuring Advice" color="text-green-400">
          <p className="mt-3 text-xs text-[#8b949e] leading-relaxed">{analysis.restructuringAdvice}</p>
        </Section>
      )}
    </div>
  );
};
