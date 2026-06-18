const axios = require('axios');

const structureResumeData = async (rawText) => {

  const systemPrompt = `You are an elite, professional CV writer and resume builder.
Your objective is to ingest raw, unstructured text about a candidate's career and transform it into a polished, high-impact, ATS-optimized resume in structured JSON.

CRITICAL DIRECTIVES:
1. **Bullet Points Enhancement**:
   - Rewrite every single experience and project bullet point to follow the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
   - Example: Change "Wrote React components for a dashboard" to "Engineered responsive frontend dashboards using React, reducing load times by 20% and improving user engagement".
   - Start each bullet point with strong, active verbs (e.g., "Spearheaded", "Architected", "Optimized", "Engineered", "Pioneered", "Consolidated", "Redesigned").
   - Quantify achievements whenever possible. If metrics aren't explicitly provided, formulate plausible professional estimates based on context (e.g., "improving API latency by 15%", "scaling application to handle 500+ daily active users").

2. **Professional Summary**:
   - Craft a highly compelling 2-3 sentence executive summary that profiles the candidate's expertise, key skills, and career focus. Keep it active, professional, and free of generic cliches.

3. **Data Completeness & Formatting**:
   - Extract ALL relevant info. Do not omit any roles, projects, or educational elements.
   - Automatically correct any grammatical issues, spelling errors, or awkward phrasings.
   - If contact details (phone, LinkedIn, GitHub) are missing, default to an empty string "".
   - Categorize technical skills strictly into 'languages', 'frameworks', and 'tools'.

4. **Return Format**:
   - You must output ONLY a valid JSON object matching the exact schema below. Do not wrap the JSON in markdown code blocks, do not add any surrounding text or explanations.

JSON SCHEMA:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or empty string",
  "linkedin": "linkedin URL or empty string",
  "github": "github URL or empty string",
  "summary": "Professional executive summary...",
  "education": [
    {
      "degree": "Degree (e.g. B.S. in Computer Science)",
      "college": "College/University Name",
      "year": "Graduation Year (e.g. 2025)",
      "cgpa": "CGPA or GPA (e.g. 9.1/10) or empty string"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Role/Title",
      "duration": "Duration (e.g., June 2023 - Present)",
      "points": [
        "Strong action-oriented bullet point describing achievement and action"
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "techStack": "Tech Stack (e.g., React, Node.js, AWS)",
      "points": [
        "Strong action-oriented bullet point highlighting implementation and impact"
      ]
    }
  ],
  "skills": {
    "languages": ["Language 1", "Language 2"],
    "frameworks": ["Framework 1", "Framework 2"],
    "tools": ["Tool 1", "Tool 2"]
  },
  "achievements": ["Significant achievement 1"],
  "certifications": ["Professional certification 1"]
}`;

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Extract and structure this resume information:\n\n${rawText}`
        }
      ]
    },
    {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  );

  const rawJSON = response.data.content[0].text;
  const cleaned = rawJSON
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const structured = JSON.parse(cleaned);
  return structured;
};

const generateCoverLetterText = async (resumeData) => {
  const systemPrompt = `You are a professional career coach and copywriter.
Your task is to write a highly professional, compelling, and customized Cover Letter based on a candidate's structured resume data.

The cover letter should:
- Be addressed to a generic "Hiring Manager".
- Have a professional, engaging opening statement specifying the applicant's name and intent to apply for professional opportunities.
- Highlight the key experiences, skills, and projects found in their resume in a narrative, persuasive format.
- Have a strong concluding paragraph indicating their enthusiasm and requesting an interview.
- Do NOT include headers (date, sender address, receiver address, or signature lines) in the body itself, because those will be handled by the LaTeX template layout.
- Write ONLY the letter body paragraphs. Do not add salutation "Dear Hiring Manager," or closing "Sincerely," as those are hardcoded in the LaTeX template.
- Return the plain text response with no markdown, no headings, and no code blocks. Just 3 body paragraphs separated by double newlines.`;

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Write a cover letter based on this resume data:\n\n${JSON.stringify(resumeData, null, 2)}`
        }
      ]
    },
    {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  );

  return response.data.content[0].text.trim();
};

module.exports = { structureResumeData, generateCoverLetterText };
