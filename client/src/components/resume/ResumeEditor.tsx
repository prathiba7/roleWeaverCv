import { motion } from 'framer-motion';
import type { ParsedResume } from '../../types';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ResumeEditorProps {
  data: ParsedResume;
  onChange: (updated: ParsedResume) => void;
}

const fieldClass = 'w-full bg-[#0d1117] border border-[#2a3347] rounded px-2 py-1.5 text-xs text-[#e6edf3] focus:outline-none focus:border-brand-500 transition-colors resize-none';
const labelClass = 'text-xs text-[#4a5568] mb-1 block';
const sectionTitleClass = 'text-xs font-semibold uppercase tracking-widest text-[#4a5568] mb-3 flex items-center justify-between';

export const ResumeEditor = ({ data, onChange }: ResumeEditorProps) => {
  const set = (field: string, value: unknown) => onChange({ ...data, [field]: value });

  const updateExp = (i: number, field: string, value: unknown) => {
    const exp = [...(data.experience || [])];
    exp[i] = { ...exp[i], [field]: value };
    set('experience', exp);
  };

  const updateBullet = (expIdx: number, bulletIdx: number, value: string) => {
    const exp = [...(data.experience || [])];
    const bullets = [...(exp[expIdx].bullets || [])];
    bullets[bulletIdx] = { text: value };
    exp[expIdx] = { ...exp[expIdx], bullets };
    set('experience', exp);
  };

  const addBullet = (expIdx: number) => {
    const exp = [...(data.experience || [])];
    exp[expIdx] = { ...exp[expIdx], bullets: [...(exp[expIdx].bullets || []), { text: '' }] };
    set('experience', exp);
  };

  const removeBullet = (expIdx: number, bulletIdx: number) => {
    const exp = [...(data.experience || [])];
    exp[expIdx] = { ...exp[expIdx], bullets: exp[expIdx].bullets.filter((_, i) => i !== bulletIdx) };
    set('experience', exp);
  };

  const addExp = () => {
    set('experience', [...(data.experience || []), { company: '', title: '', location: '', duration: '', bullets: [{ text: '' }] }]);
  };

  const removeExp = (i: number) => {
    set('experience', (data.experience || []).filter((_, idx) => idx !== i));
  };

  const updateEdu = (i: number, field: string, value: string) => {
    const edu = [...(data.education || [])];
    edu[i] = { ...edu[i], [field]: value };
    set('education', edu);
  };

  const updateCert = (i: number, field: string, value: string) => {
    const certs = [...(data.certifications || [])];
    certs[i] = { ...certs[i], [field]: value };
    set('certifications', certs);
  };

  return (
    <div className="space-y-8 text-sm">

      {/* ── Contact Info ── */}
      <section>
        <p className={sectionTitleClass}>Contact Info</p>
        <div className="grid grid-cols-2 gap-3">
          {(['name','email','phone','location','linkedin','github'] as const).map((field) => (
            <div key={field}>
              <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                className={fieldClass}
                value={String(data[field] || '')}
                onChange={(e) => set(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Summary ── */}
      <section>
        <p className={sectionTitleClass}>Summary</p>
        <textarea
          className={fieldClass}
          rows={4}
          value={data.summary || ''}
          onChange={(e) => set('summary', e.target.value)}
        />
      </section>

      {/* ── Experience ── */}
      <section>
        <p className={sectionTitleClass}>
          Experience
          <button onClick={addExp} className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors normal-case tracking-normal font-normal">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </p>
        <div className="space-y-6">
          {(data.experience || []).map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-[#4a5568]">
                  <GripVertical className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium text-[#8b949e]">Position {i + 1}</span>
                </div>
                <button onClick={() => removeExp(i)} className="text-red-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['title','company','location','duration'] as const).map((field) => (
                  <div key={field}>
                    <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      className={fieldClass}
                      value={exp[field] || ''}
                      onChange={(e) => updateExp(i, field, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass + ' mb-0'}>Bullets</label>
                  <button onClick={() => addBullet(i)} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                    <Plus className="w-3 h-3" /> Add bullet
                  </button>
                </div>
                <div className="space-y-2">
                  {(exp.bullets || []).map((b, j) => (
                    <div key={j} className="flex gap-2 items-start">
                      <span className="text-brand-500 mt-2 text-xs shrink-0">▸</span>
                      <textarea
                        className={fieldClass + ' flex-1'}
                        rows={2}
                        value={b.text}
                        onChange={(e) => updateBullet(i, j, e.target.value)}
                      />
                      <button onClick={() => removeBullet(i, j)} className="text-red-500 hover:text-red-400 mt-1.5 shrink-0 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Skills ── */}
      <section>
        <p className={sectionTitleClass}>Skills <span className="text-[#4a5568] normal-case tracking-normal font-normal text-xs">(comma separated)</span></p>
        <textarea
          className={fieldClass}
          rows={3}
          value={(data.skills || []).join(', ')}
          onChange={(e) => set('skills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </section>

      {/* ── Certifications ── */}
      {(data.certifications?.length ?? 0) > 0 && (
        <section>
          <p className={sectionTitleClass}>
            Certifications
            <button
              onClick={() => set('certifications', [...(data.certifications || []), { name: '', issuer: '', year: '' }])}
              className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors normal-case tracking-normal font-normal"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </p>
          <div className="space-y-3">
            {(data.certifications || []).map((cert, i) => (
              <div key={i} className="glass rounded-xl p-3 grid grid-cols-3 gap-3">
                {(['name','issuer','year'] as const).map((field) => (
                  <div key={field}>
                    <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      className={fieldClass}
                      value={cert[field] || ''}
                      onChange={(e) => updateCert(i, field, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Education ── */}
      <section>
        <p className={sectionTitleClass}>Education</p>
        <div className="space-y-3">
          {(data.education || []).map((edu, i) => (
            <div key={i} className="glass rounded-xl p-3 grid grid-cols-2 gap-3">
              {(['degree','field','institution','year'] as const).map((f) => (
                <div key={f}>
                  <label className={labelClass}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                  <input
                    className={fieldClass}
                    value={edu[f] || ''}
                    onChange={(e) => updateEdu(i, f, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
