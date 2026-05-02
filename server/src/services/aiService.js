const OpenAI = require('openai');

const getClient = () => new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const normalizeSections = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return parsed;
  if (parsed.experience) {
    parsed.experience = parsed.experience.map((exp) => ({
      ...exp,
      bullets: (exp.bullets || []).map((b) => typeof b === 'string' ? { text: b } : b),
    }));
  }
  const listSections = ['accomplishments', 'achievements', 'publications', 'projects', 'awards', 'volunteer'];
  listSections.forEach((key) => {
    if (Array.isArray(parsed[key])) {
      parsed[key] = parsed[key].map((item) => typeof item === 'string' ? { text: item } : item);
    }
  });
  return parsed;
};

// STEP 1: Honest critique as senior hiring manager
const critiqueResume = async (resume, companyType) => {
  const prompt = `You are a senior hiring manager at a top ${companyType} company who reviews 100+ resumes daily.

Review this resume BRUTALLY HONESTLY:
${JSON.stringify(resume, null, 2)}

Provide:
1. IMMEDIATE RED FLAGS (what would make you reject this instantly)
2. WEAK POINTS (vague bullets, missing metrics, generic language)
3. MISSING ELEMENTS (what's not here that should be)
4. STRENGTHS (what actually stands out)

Be direct and specific. No sugar-coating.`;

  const response = await getClient().chat.completions.create({
    model: process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
};

// STEP 2: ATS keyword gap analysis
const analyzeATSGaps = async (resume, jobDescription) => {
  const prompt = `You are an ATS (Applicant Tracking System) expert.

RESUME:
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Analyze and return JSON:
{
  "missingKeywords": ["keyword1", "keyword2", ...],
  "weaklyHighlightedSkills": ["skill1", "skill2", ...],
  "atsScore": 0-100,
  "restructuringAdvice": "specific advice on how to reorder/restructure bullets for ATS",
  "keywordsToAdd": { "section": "where to add", "keywords": ["list"] }
}`;

  const response = await getClient().chat.completions.create({
    model: process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

// STEP 3: Rewrite bullets with Action + Task + Result formula
const rewriteBullets = async (resume) => {
  const prompt = `You are a resume coach. Rewrite EVERY bullet point using: Action Verb + Task + Measurable Result.

ORIGINAL RESUME:
${JSON.stringify(resume, null, 2)}

For each bullet:
- Start with a strong action verb (not "Responsible for", "Worked on")
- Describe the task/project clearly
- Add measurable impact (%, $, time saved, users affected, etc.)
- If numbers are missing, use reasonable estimates based on context (e.g., "enterprise customers" → "500+ enterprise customers")

Return the FULL resume JSON with ALL bullets rewritten. Keep the exact same structure.`;

  const response = await getClient().chat.completions.create({
    model: process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

// STEP 4: Tone/language alignment with company culture
const alignToneAndLanguage = async (resume, jobDescription, companyType) => {
  const prompt = `You are a cultural fit expert for ${companyType} companies.

RESUME:
${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION (extract tone, values, language style):
${jobDescription}

Rewrite the SUMMARY and adjust language throughout to match:
- Company's tone (formal/casual, innovative/traditional, etc.)
- Industry-specific terminology
- Values they emphasize (collaboration, speed, quality, innovation, etc.)
- Remove generic applicant language
- Make it sound like an insider, not an outsider

Return the FULL resume JSON with tone-adjusted content.`;

  const response = await getClient().chat.completions.create({
    model: process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

// STEP 5: Final polish - remove clichés, fix tense, power language
const finalPolish = async (resume) => {
  const prompt = `You are a professional resume editor. Do a final quality pass:

RESUME:
${JSON.stringify(resume, null, 2)}

Fix:
1. TENSE CONSISTENCY (past jobs = past tense, current job = present tense)
2. REMOVE CLICHÉS: "team player", "hard-working", "detail-oriented", "go-getter", "self-starter", "think outside the box", "hit the ground running"
3. REMOVE GENERIC PHRASES: anything that could apply to anyone
4. REPLACE WITH SPECIFIC, POWERFUL LANGUAGE: concrete actions, technologies, methodologies
5. CHECK FOR REPETITION: vary sentence structure and action verbs

Return the FULL polished resume JSON.`;

  const response = await getClient().chat.completions.create({
    model: process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
};

// MAIN: Full 5-step pipeline
exports.tailorResume = async ({ parsedResume, jobDescription, companyType }) => {
  console.log('🔍 Step 1: Critiquing resume...');
  const critique = await critiqueResume(parsedResume, companyType);

  console.log('📊 Step 2: Analyzing ATS gaps...');
  const atsAnalysis = await analyzeATSGaps(parsedResume, jobDescription);

  console.log('✍️  Step 3: Rewriting bullets with metrics...');
  let improved = await rewriteBullets(parsedResume);

  console.log('🎨 Step 4: Aligning tone and language...');
  improved = await alignToneAndLanguage(improved, jobDescription, companyType);

  console.log('✨ Step 5: Final polish...');
  const polished = await finalPolish(improved);

  // Extract keywords that were actually used
  const keywordsMatched = atsAnalysis.missingKeywords?.slice(0, 15) || [];

  return {
    tailored: normalizeSections(polished),
    keywordsMatched,
    analysis: {
      critique,
      atsScore: atsAnalysis.atsScore || 0,
      missingKeywords: atsAnalysis.missingKeywords || [],
      weaklyHighlightedSkills: atsAnalysis.weaklyHighlightedSkills || [],
      restructuringAdvice: atsAnalysis.restructuringAdvice || '',
    },
  };
};
