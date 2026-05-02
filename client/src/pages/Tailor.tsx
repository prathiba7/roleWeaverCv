import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getResume, tailorResume, saveTailoredVersion, reTailorResume } from '../services/resumeService';
import type { Resume, TailorResult, ParsedResume } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ResumePreview } from '../components/resume/ResumePreview';
import { ResumeEditor } from '../components/resume/ResumeEditor';
import { BulletDiff } from '../components/tailor/BulletDiff';
import { KeywordBadges } from '../components/tailor/KeywordBadges';
import { AnalysisPanel } from '../components/tailor/AnalysisPanel';
import { DownloadPDFButton } from '../components/resume/DownloadPDFButton';
import { Wand2, Link2, AlignLeft, ChevronDown, CheckCircle, Loader, Save, RefreshCw, TrendingUp } from 'lucide-react';

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

type Tab = 'analysis' | 'diff' | 'original' | 'tailored' | 'edit';

export const Tailor = () => {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [jdUrl, setJdUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [companyType, setCompanyType] = useState(COMPANY_TYPES[0]);
  const [result, setResult] = useState<TailorResult | null>(null);
  const [editedResume, setEditedResume] = useState<ParsedResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [reTailoring, setReTailoring] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('analysis');

  useEffect(() => {
    if (id) getResume(id).then(setResume);
  }, [id]);

  useEffect(() => {
    if (!loading) { setCurrentStep(0); return; }
    setCurrentStep(1);
    const timings = [0, 8000, 16000, 24000, 32000];
    const timers = timings.map((delay, i) => setTimeout(() => setCurrentStep(i + 1), delay));
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  // Sync editedResume when result changes
  useEffect(() => {
    if (result?.tailored) setEditedResume(result.tailored);
  }, [result]);

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
      if (res.tailored && res.original) {
        setTab('analysis');
        setScoreHistory([res.analysis?.atsScore ?? 0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to tailor resume');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !result?.versionId || !editedResume) return;
    setSaving(true);
    try {
      await saveTailoredVersion(id, result.versionId, editedResume);
      // Update result so preview + PDF reflect saved changes
      setResult((prev) => prev ? { ...prev, tailored: editedResume } : prev);
      setSavedMsg('Changes saved!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {
      setSavedMsg('Failed to save');
      setTimeout(() => setSavedMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleReTailor = async () => {
    if (!id || !editedResume || !result) return;
    // Need the JD text — reuse last jdText or jdUrl scraped text
    const jd = jdText || jdUrl;
    if (!jd) {
      setSavedMsg('Paste the job description text to re-tailor');
      setTimeout(() => setSavedMsg(''), 3000);
      return;
    }
    setReTailoring(true);
    setError('');
    try {
      const res = await reTailorResume({
        resumeId: id,
        baseResume: editedResume,
        jobDescriptionText: jd,
        companyType,
      });
      setResult(res);
      setEditedResume(res.tailored);
      setScoreHistory((prev) => [...prev, res.analysis?.atsScore ?? 0]);
      setTab('analysis');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Re-tailor failed');
    } finally {
      setReTailoring(false);
    }
  };

  if (!resume) return (
    <div className="min-h-screen flex items-center justify-center text-[#4a5568]">Loading resume...</div>
  );

  // The resume shown in preview/PDF — use edited version if on edit tab, else result.tailored
  const displayResume = editedResume || result?.tailored;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'analysis', label: '🔍 AI Analysis' },
    { key: 'diff',     label: 'Bullet Diff' },
    { key: 'original', label: 'Original' },
    { key: 'tailored', label: 'Preview' },
    { key: 'edit',     label: '✏️ Edit' },
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

            {loading && (
              <div className="space-y-2 pt-1">
                {STEPS.map((step, i) => {
                  const done = currentStep > i + 1;
                  const active = currentStep === i + 1;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-2">
                      {done ? <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        : active ? <Loader className="w-3.5 h-3.5 text-brand-400 shrink-0 animate-spin" />
                        : <div className="w-3.5 h-3.5 rounded-full border border-[#2a3347] shrink-0" />}
                      <span className={`text-xs ${done ? 'text-green-400' : active ? 'text-brand-400' : 'text-[#4a5568]'}`}>{step.label}</span>
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
        {result && result.tailored && result.original && displayResume && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Score history */}
            {scoreHistory.length > 1 && (
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <p className="text-xs font-semibold text-[#e6edf3]">ATS Score Progress</p>
                </div>
                <div className="flex items-end gap-3">
                  {scoreHistory.map((score, i) => {
                    const prev = scoreHistory[i - 1];
                    const diff = prev !== undefined ? score - prev : null;
                    const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-[#e6edf3]">{score}</span>
                        {diff !== null && (
                          <span className={`text-xs font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-[#4a5568]'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        )}
                        <div className={`w-10 rounded-t ${color}`} style={{ height: `${Math.max(score * 0.6, 8)}px` }} />
                        <span className="text-xs text-[#4a5568]">v{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Keywords + Actions */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <KeywordBadges keywords={result.keywordsMatched} />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {tab === 'edit' && (
                  <div className="flex items-center gap-2">
                    {savedMsg && (
                      <span className={`text-xs ${savedMsg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                        {savedMsg}
                      </span>
                    )}
                    <Button onClick={handleSave} loading={saving} variant="ghost" className="text-xs">
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </Button>
                  </div>
                )}
                <DownloadPDFButton
                  data={displayResume}
                  keywords={result.keywordsMatched}
                  filename={`tailored-${resume.fileName?.replace('.pdf', '')}-resume.pdf`}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-[#2a3347]">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    tab === t.key ? 'border-brand-500 text-brand-400' : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
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
                  <BulletDiff original={result.original} tailored={displayResume} />
                </motion.div>
              )}
              {tab === 'original' && (
                <motion.div key="original" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ResumePreview data={result.original} label="Original Resume" labelColor="text-[#8b949e]" />
                </motion.div>
              )}
              {tab === 'tailored' && (
                <motion.div key="tailored" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ResumePreview data={displayResume} highlightKeywords={result.keywordsMatched} label="Tailored Resume" labelColor="text-brand-400" />
                </motion.div>
              )}
              {tab === 'edit' && editedResume && (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="glass rounded-xl p-6">
                    <p className="text-xs text-[#8b949e] mb-6">
                      Edit any field below. Changes are reflected in the Preview tab and downloaded PDF. Click <span className="text-brand-400">Save Changes</span> to persist.
                    </p>
                    <ResumeEditor data={editedResume} onChange={setEditedResume} />

                    {/* Re-tailor CTA */}
                    <div className="mt-8 pt-6 border-t border-[#2a3347] flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-[#e6edf3]">Re-Tailor with your edits</p>
                        <p className="text-xs text-[#4a5568] mt-0.5">Run the full 5-step AI pipeline again using your edited resume as the new base. See if your ATS score improves.</p>
                      </div>
                      <Button
                        onClick={handleReTailor}
                        loading={reTailoring}
                        className="shrink-0"
                      >
                        <RefreshCw className="w-4 h-4" />
                        {reTailoring ? 'Re-tailoring...' : 'Re-Tailor & Compare'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
};
