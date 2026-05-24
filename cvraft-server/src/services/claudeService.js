const axios = require('axios');

const structureResumeData = async (rawText) => {

  const systemPrompt = `You are an expert professional resume writer with 10+ years of experience.
Your job is to extract and structure resume information from raw unstructured text.

RULES:
- Fix all grammar and spelling mistakes automatically
- Make all bullet points action-oriented (use: "Developed", "Built", "Designed", "Led", "Implemented", "Improved", "Managed", "Created")
- If a detail is missing or unclear, make a smart professional assumption
- Extract ALL details — do not skip anything
- Return ONLY valid JSON — no extra text, no markdown, no code blocks
- If phone/linkedin/github is not mentioned, use empty string ""
- For skills, categorize into languages, frameworks and tools

Return this EXACT JSON structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or empty string",
  "linkedin": "linkedin URL or empty string",
  "github": "github URL or empty string",
  "summary": "2-3 line professional summary",
  "education": [
    {
      "degree": "B.E Computer Science",
      "college": "College Name",
      "year": "2024",
      "cgpa": "8.5 or empty string"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "June 2023 - Aug 2023",
      "points": [
        "Developed REST APIs using Django that improved response time by 30%"
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "techStack": "React, Node.js, MongoDB",
      "points": [
        "Built full-stack web application serving 100+ users"
      ]
    }
  ],
  "skills": {
    "languages": ["Python", "JavaScript"],
    "frameworks": ["React", "Django"],
    "tools": ["Git", "Docker"]
  },
  "achievements": ["Achievement 1"],
  "certifications": ["Certification 1"]
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

module.exports = { structureResumeData };
