import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { ParsedResume } from '../../types';

const DARK = '#111827';
const GRAY = '#4b5563';
const LIGHT_GRAY = '#9ca3af';
const ACCENT = '#1d4ed8';
const DIVIDER = '#e5e7eb';
const WHITE = '#ffffff';

const KNOWN_SECTIONS = new Set([
  'name','email','phone','location','linkedin','github','photo',
  'summary','experience','education','skills','certifications',
]);

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: DARK,
    backgroundColor: WHITE,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
  },

  // ── Header ──────────────────────────────────────────────
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  photo: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  headerText: { flex: 1 },
  name: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 1 },
  jobTitle: { fontSize: 9, color: ACCENT, marginBottom: 3 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  contactItem: { fontSize: 7.5, color: GRAY },

  divider: { borderBottomWidth: 1, borderBottomColor: DIVIDER, marginBottom: 8 },

  // ── Section ──────────────────────────────────────────────
  section: { marginBottom: 9 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    borderBottomWidth: 1,
    borderBottomColor: ACCENT,
    paddingBottom: 1.5,
    marginBottom: 5,
  },

  // ── Summary ──────────────────────────────────────────────
  summary: { fontSize: 8, color: GRAY, lineHeight: 1.4 },

  // ── Experience ───────────────────────────────────────────
  expBlock: { marginBottom: 6 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  expLeft: { flex: 1 },
  expTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  expCompany: { fontSize: 8, color: ACCENT, marginTop: 0.5 },
  expDuration: { fontSize: 7.5, color: LIGHT_GRAY, marginTop: 0.5 },
  bullet: { flexDirection: 'row', marginTop: 2, paddingLeft: 3 },
  bulletDot: { fontSize: 8, color: ACCENT, marginRight: 4, marginTop: 0.5 },
  bulletText: { fontSize: 8, color: GRAY, lineHeight: 1.3, flex: 1 },
  bulletBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: DARK },

  // ── Skills ───────────────────────────────────────────────
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  skill: {
    fontSize: 7.5, color: ACCENT,
    borderWidth: 0.5, borderColor: ACCENT,
    paddingHorizontal: 5, paddingVertical: 1.5,
    borderRadius: 2,
  },
  skillBold: {
    fontSize: 7.5, fontFamily: 'Helvetica-Bold',
    color: WHITE, backgroundColor: ACCENT,
    paddingHorizontal: 5, paddingVertical: 1.5,
    borderRadius: 2,
  },

  // ── Education ────────────────────────────────────────────
  eduRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  eduDegree: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK },
  eduInstitution: { fontSize: 7.5, color: GRAY, marginTop: 0.5 },
  eduYear: { fontSize: 7.5, color: LIGHT_GRAY },

  // ── Certifications ───────────────────────────────────────
  certRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  certName: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: DARK },
  certMeta: { fontSize: 7.5, color: LIGHT_GRAY },

  // ── Dynamic sections ─────────────────────────────────────
  dynamicItem: { flexDirection: 'row', marginBottom: 2 },
  dynamicDot: { fontSize: 8, color: ACCENT, marginRight: 4 },
  dynamicText: { fontSize: 8, color: GRAY, flex: 1, lineHeight: 1.3 },
  dynamicTitle: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 0.5 },
  dynamicMeta: { fontSize: 7.5, color: LIGHT_GRAY, marginBottom: 1.5 },
});

// Bold matched keywords inside any text
const BoldText = ({ text, keywords, style }: { text: string; keywords: string[]; style?: any }) => {
  if (!keywords.length || !text) return <Text style={style || s.bulletText}>{text}</Text>;
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <Text style={style || s.bulletText}>
      {parts.map((part, i) =>
        regex.test(part)
          ? <Text key={i} style={s.bulletBold}>{part}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
};

const SectionTitle = ({ children }: { children: string }) => (
  <Text style={s.sectionTitle}>{children}</Text>
);

const DynamicSection = ({ label, value, keywords }: { label: string; value: unknown; keywords: string[] }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const title = label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <View style={s.section}>
      <SectionTitle>{title}</SectionTitle>
      {Array.isArray(value) ? value.map((item: unknown, i: number) => {
        if (typeof item === 'string') return (
          <View key={i} style={s.dynamicItem}>
            <Text style={s.dynamicDot}>•</Text>
            <BoldText text={item} keywords={keywords} style={s.dynamicText} />
          </View>
        );
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          const text = String(obj.text || obj.description || obj.summary || obj.details || '');
          const titleVal = String(obj.title || obj.name || obj.role || '');
          const meta = [obj.organization, obj.publisher, obj.issuer, obj.date, obj.year].filter(Boolean).join(' · ');
          return (
            <View key={i} style={{ marginBottom: 5 }}>
              {titleVal ? <Text style={s.dynamicTitle}>{titleVal}</Text> : null}
              {meta ? <Text style={s.dynamicMeta}>{meta}</Text> : null}
              {text ? (
                <View style={s.dynamicItem}>
                  <Text style={s.dynamicDot}>•</Text>
                  <BoldText text={text} keywords={keywords} style={s.dynamicText} />
                </View>
              ) : null}
            </View>
          );
        }
        return null;
      }) : <Text style={s.dynamicText}>{String(value)}</Text>}
    </View>
  );
};

interface ResumePDFProps {
  data: ParsedResume;
  keywords?: string[];
}

export const ResumePDF = ({ data, keywords = [] }: ResumePDFProps) => {
  const jobTitle = data.experience?.[0]?.title || '';
  const dynamicSections = Object.entries(data).filter(
    ([key]) => !KNOWN_SECTIONS.has(key) && !['summary','experience','education','skills','certifications'].includes(key)
  );

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.headerRow}>
          {data.photo && <Image src={data.photo} style={s.photo} />}
          <View style={s.headerText}>
            <Text style={s.name}>{data.name}</Text>
            {jobTitle ? <Text style={s.jobTitle}>{jobTitle}</Text> : null}
            <View style={s.contactRow}>
              {data.email    && <Text style={s.contactItem}>{data.email}</Text>}
              {data.phone    && <Text style={s.contactItem}>| {data.phone}</Text>}
              {data.location && <Text style={s.contactItem}>| {data.location}</Text>}
              {data.linkedin && <Text style={s.contactItem}>| {String(data.linkedin).replace('https://','')}</Text>}
              {data.github   && <Text style={s.contactItem}>| {String(data.github).replace('https://','')}</Text>}
            </View>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── SUMMARY ── */}
        {data.summary && (
          <View style={s.section}>
            <SectionTitle>Professional Summary</SectionTitle>
            <BoldText text={data.summary} keywords={keywords} style={s.summary} />
          </View>
        )}

        {/* ── EXPERIENCE ── */}
        {data.experience?.length > 0 && (
          <View style={s.section}>
            <SectionTitle>Experience</SectionTitle>
            {data.experience.map((exp, i) => (
              <View key={i} style={s.expBlock}>
                <View style={s.expHeader}>
                  <View style={s.expLeft}>
                    <Text style={s.expTitle}>{exp.title}</Text>
                    <Text style={s.expCompany}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</Text>
                  </View>
                  <Text style={s.expDuration}>{exp.duration}</Text>
                </View>
                {exp.bullets?.map((b, j) => (
                  <View key={j} style={s.bullet}>
                    <Text style={s.bulletDot}>•</Text>
                    <BoldText text={b.text} keywords={keywords} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── DYNAMIC SECTIONS (accomplishments, publications, projects, awards…) ── */}
        {dynamicSections.map(([key, value]) => (
          <DynamicSection key={key} label={key} value={value} keywords={keywords} />
        ))}

        {/* ── SKILLS ── */}
        {data.skills?.length > 0 && (
          <View style={s.section}>
            <SectionTitle>Skills</SectionTitle>
            <View style={s.skillsRow}>
              {data.skills.map((skill, i) => {
                const isMatch = keywords.some((k) => k.toLowerCase() === skill.toLowerCase());
                return <Text key={i} style={isMatch ? s.skillBold : s.skill}>{skill}</Text>;
              })}
            </View>
          </View>
        )}

        {/* ── CERTIFICATIONS ── */}
        {data.certifications && data.certifications.length > 0 && (
          <View style={s.section}>
            <SectionTitle>Certifications</SectionTitle>
            {data.certifications?.map((cert, i) => (
              <View key={i} style={s.certRow}>
                <View>
                  <Text style={s.certName}>{cert.name}</Text>
                  {cert.issuer && <Text style={s.certMeta}>{cert.issuer}</Text>}
                </View>
                {cert.year && <Text style={s.certMeta}>{cert.year}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* ── EDUCATION ── */}
        {data.education?.length > 0 && (
          <View style={s.section}>
            <SectionTitle>Education</SectionTitle>
            {data.education.map((edu, i) => (
              <View key={i} style={s.eduRow}>
                <View>
                  <Text style={s.eduDegree}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</Text>
                  <Text style={s.eduInstitution}>{edu.institution}</Text>
                </View>
                <Text style={s.eduYear}>{edu.year}</Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
};
