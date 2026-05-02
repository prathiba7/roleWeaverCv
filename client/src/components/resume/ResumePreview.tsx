import type { ParsedResume } from '../../types';
import { Mail, Phone, MapPin, Link2 } from 'lucide-react';

interface ResumePreviewProps {
  data: ParsedResume;
  highlightKeywords?: string[];
  label?: string;
  labelColor?: string;
}

// Known sections rendered explicitly
const KNOWN_SECTIONS = new Set([
  'name','email','phone','location','linkedin','github','photo',
  'summary','experience','education','skills','certifications',
]);

const highlight = (text: string, keywords: string[]) => {
  if (!keywords.length || !text) return <>{text}</>;
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-brand-500/25 text-brand-200 font-bold rounded px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const SectionTitle = ({ children }: { children: string }) => (
  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#4a5568] mb-2">{children}</h3>
);

const DynamicSection = ({ label, value, keywords }: { label: string; value: unknown; keywords: string[] }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const title = label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const renderItem = (item: unknown, i: number) => {
    if (typeof item === 'string') {
      return (
        <li key={i} className="text-[#8b949e] flex gap-2">
          <span className="text-brand-500 mt-1 shrink-0">▸</span>
          <span>{highlight(item, keywords)}</span>
        </li>
      );
    }
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      const text = obj.text || obj.description || obj.summary || obj.details;
      const titleVal = obj.title || obj.name || obj.role;
      const meta = [obj.organization, obj.publisher, obj.issuer, obj.date, obj.year].filter(Boolean).join(' · ');
      return (
        <li key={i} className="mb-2">
          {titleVal && <p className="text-[#e6edf3] font-semibold text-xs">{String(titleVal)}</p>}
          {meta && <p className="text-brand-400 text-xs">{meta}</p>}
          {text && (
            <p className="text-[#8b949e] text-xs mt-0.5">{highlight(String(text), keywords)}</p>
          )}
        </li>
      );
    }
    return null;
  };

  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      {Array.isArray(value) ? (
        <ul className="space-y-1">{value.map((item, i) => renderItem(item, i))}</ul>
      ) : (
        <p className="text-[#8b949e] text-xs">{highlight(String(value), keywords)}</p>
      )}
    </div>
  );
};

export const ResumePreview = ({ data, highlightKeywords = [], label, labelColor = 'text-brand-400' }: ResumePreviewProps) => {
  const dynamicSections = Object.entries(data).filter(
    ([key]) => !KNOWN_SECTIONS.has(key) && key !== 'summary' && key !== 'experience' && key !== 'education' && key !== 'skills' && key !== 'certifications'
  );

  return (
    <div className="bg-[#0d1117] rounded-xl border border-[#2a3347] overflow-hidden">
      {label && (
        <div className={`px-5 py-2 border-b border-[#2a3347] text-xs font-semibold uppercase tracking-widest ${labelColor}`}>
          {label}
        </div>
      )}
      <div className="p-6 space-y-5 text-sm font-mono">

        {/* Header */}
        <div className="border-b border-[#2a3347] pb-4">
          <h2 className="text-xl font-bold text-[#e6edf3]">{data.name}</h2>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#8b949e]">
            {data.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{data.email}</span>}
            {data.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{data.phone}</span>}
            {data.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{data.location}</span>}
            {data.linkedin && <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{String(data.linkedin)}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div>
            <SectionTitle>Summary</SectionTitle>
            <p className="text-[#c9d1d9] leading-relaxed">{highlight(data.summary, highlightKeywords)}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div>
            <SectionTitle>Experience</SectionTitle>
            <div className="space-y-4">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[#e6edf3]">{exp.title}</p>
                      <p className="text-brand-400 text-xs">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                    </div>
                    <span className="text-xs text-[#4a5568] shrink-0 ml-2">{exp.duration}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {exp.bullets?.map((b, j) => (
                      <li key={j} className="text-[#8b949e] flex gap-2">
                        <span className="text-brand-500 mt-1 shrink-0">▸</span>
                        <span>{highlight(b.text, highlightKeywords)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic sections (accomplishments, publications, projects, awards, etc.) */}
        {dynamicSections.map(([key, value]) => (
          <DynamicSection key={key} label={key} value={value} keywords={highlightKeywords} />
        ))}

        {/* Skills */}
        {data.skills?.length > 0 && (
          <div>
            <SectionTitle>Skills</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill, i) => {
                const isMatch = highlightKeywords.some((k) => k.toLowerCase() === skill.toLowerCase());
                return (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded text-xs border ${
                      isMatch
                        ? 'border-brand-500/60 bg-brand-500/15 text-brand-200 font-bold'
                        : 'border-[#2a3347] text-[#8b949e]'
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications?.length > 0 && (
          <div>
            <SectionTitle>Certifications</SectionTitle>
            {data.certifications.map((cert, i) => (
              <div key={i} className="mb-2">
                <p className="text-[#e6edf3] font-semibold text-xs">{highlight(cert.name, highlightKeywords)}</p>
                {(cert.issuer || cert.year) && (
                  <p className="text-brand-400 text-xs">{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <div>
            <SectionTitle>Education</SectionTitle>
            {data.education.map((edu, i) => (
              <div key={i} className="flex justify-between mb-2">
                <div>
                  <p className="text-[#e6edf3] font-medium">{edu.degree}{edu.field && ` in ${edu.field}`}</p>
                  <p className="text-xs text-[#8b949e]">{edu.institution}</p>
                </div>
                <span className="text-xs text-[#4a5568]">{edu.year}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
