const pdfParse = require('pdf-parse');
const OpenAI = require('openai');

const getClient = () => new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const PARSE_PROMPT = `You are a resume parser. Extract ALL content from the resume and return ONLY valid JSON.

CRITICAL RULES:
1. Capture EVERY section that exists in the resume — do not skip any section.
2. Common sections include but are NOT limited to: summary, objective, experience, education, skills, certifications, accomplishments, achievements, publications, projects, awards, languages, volunteer, interests, references, courses, patents.
3. Use the EXACT section name from the resume as the JSON key (lowercase, underscores for spaces). Example: "key_achievements", "publications", "volunteer_work".
4. For experience bullets, always use { "text": "..." } objects, never plain strings.
5. Always include these base fields: name, email, phone, location, linkedin, github.

Return this structure (add any extra sections found):
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "summary": "",
  "experience": [{ "company": "", "title": "", "location": "", "duration": "", "bullets": [{ "text": "" }] }],
  "education": [{ "institution": "", "degree": "", "field": "", "year": "" }],
  "skills": [],
  "certifications": [{ "name": "", "issuer": "", "year": "" }],
  "accomplishments": [{ "text": "" }],
  "...any other sections found in the resume as additional keys..."
}

Return ONLY the JSON object. No explanation.`;

const normalizeSections = (parsed) => {
  // Normalize experience bullets
  if (parsed.experience) {
    parsed.experience = parsed.experience.map((exp) => ({
      ...exp,
      bullets: (exp.bullets || []).map((b) =>
        typeof b === 'string' ? { text: b } : b
      ),
    }));
  }

  // Normalize any other array-of-strings sections into { text } objects
  // e.g. accomplishments, achievements, publications, projects
  const listSections = ['accomplishments', 'achievements', 'publications', 'projects', 'awards', 'volunteer'];
  listSections.forEach((key) => {
    if (Array.isArray(parsed[key])) {
      parsed[key] = parsed[key].map((item) =>
        typeof item === 'string' ? { text: item } : item
      );
    }
  });

  return parsed;
};

exports.parsePDF = async (buffer) => {
  const data = await pdfParse(buffer);
  const text = data.text;
  const response = await getClient().chat.completions.create({
    model: process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    messages: [
      { role: 'system', content: PARSE_PROMPT },
      { role: 'user', content: text },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;
  const parsed = normalizeSections(JSON.parse(raw));
  return { parsed, originalText: text };
};
