import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getResume, tailorResume } from '../services/resumeService';
import type { Resume, TailorResult } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ResumePreview } from '../components/resume/ResumePreview';
import { BulletDiff } from '../components/tailor/BulletDiff';
import { KeywordBadges } from '../components/tailor/KeywordBadges';
import { AnalysisPanel } from '../components/tailor/AnalysisPanel';
import { DownloadPDFButton } from '../components/resume/DownloadPDFButton';
import { Wand2, Link2, AlignLeft, ChevronDown, CheckCircle, Loader } from 'lucide-react';

const COMPANY_TYPES = [
  'FAANG / Big Tech', 'Series A Startup', 'Series B/C Startup',
  'Enterprise SaaS', 'Fintech', 'Healthcare Tech', 'Consulting Firm', 'Remote-first Company',
];

const STEPS = [
  { label: 'Critiquing as hiring manager' },
  { label: 'Analyzing ATS keyword gaps' },
  { label: 'Rewriting bullets with metrics' },
  { label: 'Aligning tone to company culture' },
  { label: 'Final polish & cliché removal' },
];

type Tab = 'analysis' | 'diff' | 'original' | 'tailored';

export const Tailor = () => {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [jdUrl, setJdUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [companyType, setCompanyType] = useState(COMPANY_TYPES[0]);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('analysis');

  useEffect(() => {
    if (id) getResume(id).then(setResume);
  }, [id]);

  // Simulate step progress while waiting for API
  useEffect(() => {
    if (!loading) { setCurrentStep(0); return; }
    setCurrentStep(1);
    const timings = [0, 8000, 16000, 24000, 32000];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setCurrentStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const handleTailor = async () => {
    if (!id) return;
    setError('');
    setLoading(true);
    try {
      const res = await tailorResume({
        resumeId: id,
        jobDescriptionUrl: inputMode === 'url' ? jdUrl : undefined,
        jobDescriptionText: inputMode === 'text' ? jdText : undefined,
        companyType,
      });
      setResult(res);
      if (res.tailored && res.original) setTab('analysis');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to tailor resume');
    } finally {
      setLoading(false);
    }
  };

  if (!resume) return (
    <div className="min-h-screen flex items-center justify-center text-[#4a5568]">Loading resume...</div>
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'analysis', label: '🔍 AI Analysis' },
    { key: 'diff', label: 'Bullet Diff' },
    { key: 'original', label: 'Original' },
    { key: 'tailored', label: 'Tailored' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e6edf3]">Tailor Resume</h1>
        <p className="text-sm text-[#8b949e] mt-1">{resume.fileName}</p>
      </div>

      {/* Input Panel */}
      <div className="glass rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${inputMode === 'url' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40' : 'text-[#8b949e] border border-[#2a3347]'}`}
              >
                <Link2 className="w-3.5 h-3.5" /> Job URL
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${inputMode === 'text' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40' : 'text-[#8b949e] border border-[#2a3347]'}`}
              >
                <AlignLeft className="w-3.5 h-3.5" /> Paste Text
              </button>
            </div>
            <AnimatePresence mode="wait">
              {inputMode === 'url' ? (
                <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Input placeholder="https://linkedin.com/jobs/view/..." value={jdUrl} onChange={(e) => setJdUrl(e.target.value)} />
                </motion.div>
              ) : (
                <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <textarea
                    className="w-full h-32 px-3 py-2.5 rounded-lg bg-[#161b27] border border-[#2a3347] text-[#e6edf3] placeholder-[#4a5568] focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none"
                    placeholder="Paste the full job description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#8b949e]">Company Type</label>
              <div className="relative">
                <select
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#161b27] border border-[#2a3347] text-[#e6edf3] focus:outline-none focus:border-brand-500 transition-colors text-sm appearance-none cursor-pointer"
                >
                  {COMPANY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-[#4a5568] pointer-events-none" />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button
              onClick={handleTailor}
              loading={loading}
              disabled={inputMode === 'url' ? !jdUrl : !jdText}
              className="w-full justify-center py-3"
            >
              <Wand2 className="w-4 h-4" />
              {loading ? 'Running 5-step AI pipeline...' : 'Tailor My Resume'}
            </Button>

            {/* Step progress */}
            {loading && (
              <div className="space-y-2 pt-1">
                {STEPS.map((step, i) => {
                  const done = currentStep > i + 1;
                  const active = currentStep === i + 1;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      {done ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      ) : active ? (
                        <Loader className="w-3.5 h-3.5 text-brand-400 shrink-0 animate-spin" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-[#2a3347] shrink-0" />
                      )}
                      <span className={`text-xs ${done ? 'text-green-400' : active ? 'text-brand-400' : 'text-[#4a5568]'}`}>
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && result.tailored && result.original && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Keywords + Download */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <KeywordBadges keywords={result.keywordsMatched} />
              </div>
              <DownloadPDFButton
                data={result.tailored}
                keywords={result.keywordsMatched}
                filename={`tailored-${resume.fileName?.replace('.pdf', '')}-resume.pdf`}
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-[#2a3347]">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    tab === t.key
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === 'analysis' && result.analysis && (
                <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AnalysisPanel analysis={result.analysis} />
                </motion.div>
              )}
              {tab === 'diff' && (
                <motion.div key="diff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <BulletDiff original={result.original} tailored={result.tailored} />
                </motion.div>
              )}
              {tab === 'original' && (
                <motion.div key="original" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ResumePreview data={result.original} label="Original Resume" labelColor="text-[#8b949e]" />
                </motion.div>
              )}
              {tab === 'tailored' && (
                <motion.div key="tailored" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ResumePreview data={result.tailored} highlightKeywords={result.keywordsMatched} label="Tailored Resume" labelColor="text-brand-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
