import { Document, Page, Text, View, StyleSheet, Link, Image } from '@react-pdf/renderer';
import type { ParsedResume } from '../../types';

const BLUE = '#1e3a5f';
const ACCENT = '#2563eb';
const LIGHT_BG = '#eef2f7';
const WHITE = '#ffffff';
const GRAY = '#4b5563';
const DARK = '#111827';

// Sections handled explicitly — everything else rendered as dynamic
const KNOWN_SECTIONS = new Set([
  'name','email','phone','location','linkedin','github','photo',
  'summary','experience','education','skills','certifications',
]);

const styles = StyleSheet.create({
  page: { flexDirection: 'row', fontFamily: 'Helvetica', fontSize: 9, backgroundColor: WHITE },
  left: { width: '35%', backgroundColor: BLUE, padding: 20, minHeight: '100%' },
  photoWrapper: { alignItems: 'center', marginBottom: 14 },
  photo: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: WHITE },
  photoPlaceholder: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  photoInitial: { color: WHITE, fontSize: 28, fontFamily: 'Helvetica-Bold' },
  leftName: { color: WHITE, fontSize: 15, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 2 },
  leftTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 8, textAlign: 'center', marginBottom: 14 },
  leftSection: { marginBottom: 14 },
  leftSectionTitle: {
    color: WHITE, fontSize: 8, fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase', letterSpacing: 1.5,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingBottom: 3, marginBottom: 6,
  },
  contactItem: { color: 'rgba(255,255,255,0.85)', fontSize: 8, marginBottom: 3 },
  skillBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)', color: WHITE,
    fontSize: 7.5, paddingHorizontal: 6, paddingVertical: 2.5,
    borderRadius: 3, marginBottom: 3, marginRight: 3,
  },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  certItem: { marginBottom: 5 },
  certName: { color: WHITE, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  certMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 7.5 },
  right: { width: '65%', padding: 22 },
  rightSection: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 9, fontFamily: 'Helvetica-Bold', color: ACCENT,
    textTransform: 'uppercase', letterSpacing: 1.2,
    borderBottomWidth: 1, borderBottomColor: LIGHT_BG,
    paddingBottom: 3, marginBottom: 7,
  },
  summary: { fontSize: 8.5, color: GRAY, lineHeight: 1.55 },
  expBlock: { marginBottom: 9 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
  expTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: DARK },
  expCompany: { fontSize: 8.5, color: ACCENT },
  expDuration: { fontSize: 7.5, color: GRAY, backgroundColor: LIGHT_BG, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 2 },
  bullet: { flexDirection: 'row', marginTop: 2.5, paddingLeft: 2 },
  bulletDot: { fontSize: 8, color: ACCENT, marginRight: 4, marginTop: 0.5 },
  bulletText: { fontSize: 8.5, color: GRAY, lineHeight: 1.45, flex: 1 },
  bulletBold: { fontSize: 8.5, color: DARK, fontFamily: 'Helvetica-Bold' },
  eduBlock: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  eduDegree: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  eduInstitution: { fontSize: 8, color: GRAY, marginTop: 1 },
  eduYear: { fontSize: 8, color: GRAY },
  dynamicItem: { flexDirection: 'row', marginBottom: 3 },
  dynamicDot: { fontSize: 8, color: ACCENT, marginRight: 4 },
  dynamicText: { fontSize: 8.5, color: GRAY, flex: 1, lineHeight: 1.45 },
  dynamicBold: { fontSize: 8.5, color: DARK, fontFamily: 'Helvetica-Bold' },
  dynamicSubtitle: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 1 },
  dynamicMeta: { fontSize: 8, color: GRAY, marginBottom: 3 },
});

const BoldKeywords = ({ text, keywords }: { text: string; keywords: string[] }) => {
  if (!keywords.length || !text) return <Text style={styles.bulletText}>{text}</Text>;
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <Text style={styles.bulletText}>
      {parts.map((part, i) =>
        regex.test(part)
          ? <Text key={i} style={styles.bulletBold}>{part}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
};

// Renders any unknown section dynamically
const DynamicSection = ({ label, value, keywords }: { label: string; value: unknown; keywords: string[] }) => {
  const title = label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <View style={styles.rightSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {Array.isArray(value) ? (
        value.map((item: unknown, i: number) => {
          if (typeof item === 'string') {
            return (
              <View key={i} style={styles.dynamicItem}>
                <Text style={styles.dynamicDot}>▸</Text>
                <BoldKeywords text={item} keywords={keywords} />
              </View>
            );
          }
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>;
            // { text } format
            if (obj.text) return (
              <View key={i} style={styles.dynamicItem}>
                <Text style={styles.dynamicDot}>▸</Text>
                <BoldKeywords text={String(obj.text)} keywords={keywords} />
              </View>
            );
            // { title/name, description/summary, ... } format
            const titleVal = obj.title || obj.name || obj.role || '';
            const descVal = obj.description || obj.summary || obj.details || obj.url || '';
            const metaVal = [obj.organization, obj.publisher, obj.date, obj.year].filter(Boolean).join(' · ');
            return (
              <View key={i} style={{ marginBottom: 5 }}>
                {titleVal ? <Text style={styles.dynamicSubtitle}>{String(titleVal)}</Text> : null}
                {metaVal ? <Text style={styles.dynamicMeta}>{metaVal}</Text> : null}
                {descVal ? (
                  <View style={styles.dynamicItem}>
                    <Text style={styles.dynamicDot}>▸</Text>
                    <BoldKeywords text={String(descVal)} keywords={keywords} />
                  </View>
                ) : null}
              </View>
            );
          }
          return null;
        })
      ) : (
        <Text style={styles.dynamicText}>{String(value)}</Text>
      )}
    </View>
  );
};

interface ResumePDFProps {
  data: ParsedResume;
  keywords?: string[];
}

export const ResumePDF = ({ data, keywords = [] }: ResumePDFProps) => {
  const initials = data.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const jobTitle = data.experience?.[0]?.title || '';

  // Collect all dynamic sections not handled explicitly
  const dynamicSections = Object.entries(data).filter(
    ([key]) => !KNOWN_SECTIONS.has(key) && key !== 'summary' && key !== 'experience' && key !== 'education' && key !== 'skills' && key !== 'certifications'
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* LEFT COLUMN */}
        <View style={styles.left}>
          <View style={styles.photoWrapper}>
            {data.photo ? (
              <Image src={data.photo} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitial}>{initials}</Text>
              </View>
            )}
          </View>

          <Text style={styles.leftName}>{data.name}</Text>
          {jobTitle ? <Text style={styles.leftTitle}>{jobTitle}</Text> : null}

          <View style={styles.leftSection}>
            <Text style={styles.leftSectionTitle}>Contact</Text>
            {data.email && <Text style={styles.contactItem}>✉  {data.email}</Text>}
            {data.phone && <Text style={styles.contactItem}>✆  {data.phone}</Text>}
            {data.location && <Text style={styles.contactItem}>⌖  {data.location}</Text>}
            {data.linkedin && <Text style={styles.contactItem}>in  {String(data.linkedin).replace('https://', '')}</Text>}
            {data.github && <Text style={styles.contactItem}>⌥  {String(data.github).replace('https://', '')}</Text>}
          </View>

          {data.skills?.length > 0 && (
            <View style={styles.leftSection}>
              <Text style={styles.leftSectionTitle}>Skills</Text>
              <View style={styles.skillsWrap}>
                {data.skills.map((skill, i) => (
                  <Text key={i} style={styles.skillBadge}>{skill}</Text>
                ))}
              </View>
            </View>
          )}

          {data.certifications?.length > 0 && (
            <View style={styles.leftSection}>
              <Text style={styles.leftSectionTitle}>Certifications</Text>
              {data.certifications.map((cert, i) => (
                <View key={i} style={styles.certItem}>
                  <Text style={styles.certName}>{cert.name}</Text>
                  {(cert.issuer || cert.year) && (
                    <Text style={styles.certMeta}>{[cert.issuer, cert.year].filter(Boolean).join(' · ')}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* RIGHT COLUMN */}
        <View style={styles.right}>
          {data.summary && (
            <View style={styles.rightSection}>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
              <Text style={styles.summary}>{data.summary}</Text>
            </View>
          )}

          {data.experience?.length > 0 && (
            <View style={styles.rightSection}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {data.experience.map((exp, i) => (
                <View key={i} style={styles.expBlock}>
                  <View style={styles.expHeader}>
                    <View>
                      <Text style={styles.expTitle}>{exp.title}</Text>
                      <Text style={styles.expCompany}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</Text>
                    </View>
                    <Text style={styles.expDuration}>{exp.duration}</Text>
                  </View>
                  {exp.bullets?.map((b, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletDot}>▸</Text>
                      <BoldKeywords text={b.text} keywords={keywords} />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* All dynamic sections: accomplishments, publications, projects, awards, etc. */}
          {dynamicSections.map(([key, value]) => (
            <DynamicSection key={key} label={key} value={value} keywords={keywords} />
          ))}

          {data.education?.length > 0 && (
            <View style={styles.rightSection}>
              <Text style={styles.sectionTitle}>Education</Text>
              {data.education.map((edu, i) => (
                <View key={i} style={styles.eduBlock}>
                  <View>
                    <Text style={styles.eduDegree}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</Text>
                    <Text style={styles.eduInstitution}>{edu.institution}</Text>
                  </View>
                  <Text style={styles.eduYear}>{edu.year}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
