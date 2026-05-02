import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Layers, Zap, Target, GitCompare, ArrowRight } from 'lucide-react';

const features = [
  { icon: Zap, title: 'AI-Powered Rewriting', desc: 'Acts as a senior recruiter screening 200+ resumes/day. Rewrites every bullet into a measurable achievement.' },
  { icon: Target, title: 'Keyword Alignment', desc: 'Extracts keywords from the job description and weaves them naturally — no stuffing, just precision.' },
  { icon: GitCompare, title: 'Before / After Diff', desc: 'See exactly what changed. Every bullet compared side-by-side with color-coded highlights.' },
  { icon: Layers, title: 'Template Preserved', desc: 'Your resume structure stays intact. Only the content is rewritten to match the target role.' },
];

export const Landing = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,110,247,0.08),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 text-xs mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          AI Resume Tailoring · Free & Open Source
        </span>
        <h1 className="text-5xl font-bold leading-tight mb-5">
          Your resume,{' '}
          <span className="gradient-text">rewritten for every role</span>
        </h1>
        <p className="text-[#8b949e] text-lg mb-8 max-w-xl mx-auto">
          Upload your resume once. Paste any job description. Get a tailored version in seconds — with measurable achievements, aligned keywords, and zero generic fluff.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/register">
            <Button className="px-6 py-3 text-base">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" className="px-6 py-3 text-base">Sign In</Button>
          </Link>
        </div>
      </motion.div>
    </section>

    {/* Features */}
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-6 hover:border-brand-500/40 transition-colors"
          >
            <f.icon className="w-6 h-6 text-brand-400 mb-3" />
            <h3 className="font-semibold text-[#e6edf3] mb-1">{f.title}</h3>
            <p className="text-sm text-[#8b949e]">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 px-6 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-xl mx-auto glass rounded-2xl p-10 glow"
      >
        <h2 className="text-2xl font-bold mb-3">Ready to stand out?</h2>
        <p className="text-[#8b949e] text-sm mb-6">Join developers using RoleWeaver CV to land interviews faster.</p>
        <Link to="/register">
          <Button className="px-8">Start Tailoring Now</Button>
        </Link>
      </motion.div>
    </section>
  </div>
);
