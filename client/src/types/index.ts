export interface Bullet {
  text: string;
}

export interface Experience {
  company: string;
  title: string;
  location: string;
  duration: string;
  bullets: Bullet[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  year?: string;
}

export interface Accomplishment {
  text: string;
}

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github?: string;
  photo?: string;
  summary: string;
  experience: Experience[];
  skills: string[];
  education: Education[];
  certifications?: Certification[];
  accomplishments?: Accomplishment[];
  // dynamic sections (publications, projects, awards, etc.)
  [key: string]: unknown;
}

export interface TailoredVersion {
  _id: string;
  jobTitle: string;
  companyType: string;
  jobDescription: string;
  tailored: ParsedResume;
  keywordsMatched: string[];
  createdAt: string;
}

export interface Resume {
  _id: string;
  fileName: string;
  parsed: ParsedResume;
  tailoredVersions: TailoredVersion[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ATSAnalysis {
  critique: string;
  atsScore: number;
  missingKeywords: string[];
  weaklyHighlightedSkills: string[];
  restructuringAdvice: string;
}

export interface TailorResult {
  original: ParsedResume;
  tailored: ParsedResume;
  keywordsMatched: string[];
  analysis: ATSAnalysis;
  versionId: string;
}
