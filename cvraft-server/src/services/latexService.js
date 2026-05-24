const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ── Escape special LaTeX characters ──────────────────
const escapeLatex = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
};

// ── Build LaTeX code from JSON data ──────────────────
const buildLatexCode = (data) => {
  const name = escapeLatex(data.name || 'Your Name');
  const email = escapeLatex(data.email || '');
  const phone = escapeLatex(data.phone || '');
  const linkedin = escapeLatex(data.linkedin || '');
  const github = escapeLatex(data.github || '');
  const summary = escapeLatex(data.summary || '');

  // Education
  let educationBlock = '';
  (data.education || []).forEach(edu => {
    educationBlock += `
  \\resumeSubheading
    {${escapeLatex(edu.college || '')}}{${escapeLatex(edu.year || '')}}
    {${escapeLatex(edu.degree || '')}}{CGPA: ${escapeLatex(edu.cgpa || '')}}`;
  });

  // Experience
  let experienceSection = '';
  if (data.experience && data.experience.length > 0) {
    experienceSection = `\\section{Experience}
\\resumeSubHeadingListStart`;
    data.experience.forEach(exp => {
      experienceSection += `
  \\resumeSubheading
    {${escapeLatex(exp.role || '')}}{${escapeLatex(exp.duration || '')}}
    {${escapeLatex(exp.company || '')}}{}
  \\resumeItemListStart`;
      (exp.points || []).forEach(point => {
        experienceSection += `\n    \\resumeItem{${escapeLatex(point)}}`;
      });
      experienceSection += `\n  \\resumeItemListEnd`;
    });
    experienceSection += `\n\\resumeSubHeadingListEnd`;
  }

  // Projects
  let projectsBlock = '';
  (data.projects || []).forEach(proj => {
    projectsBlock += `
  \\resumeProjectHeading
    {\\textbf{${escapeLatex(proj.name || '')}} $|$ \\emph{${escapeLatex(proj.techStack || '')}}}{}
  \\resumeItemListStart`;
    (proj.points || []).forEach(point => {
      projectsBlock += `\n    \\resumeItem{${escapeLatex(point)}}`;
    });
    projectsBlock += `\n  \\resumeItemListEnd`;
  });

  // Skills
  const languages = escapeLatex((data.skills?.languages || []).join(', '));
  const frameworks = escapeLatex((data.skills?.frameworks || []).join(', '));
  const tools = escapeLatex((data.skills?.tools || []).join(', '));

  // Achievements
  let achievementsSection = '';
  if (data.achievements && data.achievements.length > 0) {
    achievementsSection = `\\section{Achievements}
\\resumeItemListStart`;
    data.achievements.forEach(ach => {
      achievementsSection += `\n  \\resumeItem{${escapeLatex(ach)}}`;
    });
    achievementsSection += `\n\\resumeItemListEnd`;
  }

  // Contact line
  let contactParts = [];
  if (phone) contactParts.push(phone);
  if (email) contactParts.push(`\\href{mailto:${email}}{\\underline{${email}}}`);
  if (linkedin) contactParts.push(`\\href{https://${linkedin}}{\\underline{linkedin}}`);
  if (github) contactParts.push(`\\href{https://${github}}{\\underline{github}}`);
  const contactLine = contactParts.join(' $|$ ');

  // Full LaTeX document
  const latex = `\\documentclass[letterpaper,11pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
    \\small ${contactLine}
\\end{center}

\\section{Summary}
\\small{${summary}}

\\section{Education}
\\resumeSubHeadingListStart
${educationBlock}
\\resumeSubHeadingListEnd

${experienceSection}

\\section{Projects}
\\resumeSubHeadingListStart
${projectsBlock}
\\resumeSubHeadingListEnd

\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\small{\\item{
    \\textbf{Languages}{: ${languages}} \\\\
    \\textbf{Frameworks}{: ${frameworks}} \\\\
    \\textbf{Tools}{: ${tools}}
  }}
\\end{itemize}

${achievementsSection}

\\end{document}`;

  return latex;
};

// ── Compile LaTeX → PDF ───────────────────────────────
const compileToPDF = async (latexCode) => {

  // Try multiple APIs in order
  const apis = [
    {
      name: 'latex.ytotech.com',
      fn: async () => {
        const response = await axios.post(
          'https://latex.ytotech.com/builds/sync',
          {
            compiler: 'pdflatex',
            resources: [{ main: true, content: latexCode }]
          },
          {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );
        return Buffer.from(response.data);
      }
    },
    {
      name: 'latexonline.cc',
      fn: async () => {
        const encodedTex = encodeURIComponent(latexCode);
        const response = await axios.get(
          `https://latexonline.cc/compile?text=${encodedTex}`,
          {
            responseType: 'arraybuffer',
            timeout: 30000
          }
        );
        return Buffer.from(response.data);
      }
    }
  ];

  for (const api of apis) {
    try {
      console.log(`📄 Trying ${api.name}...`);
      const pdfBuffer = await api.fn();

      // Verify it's actually a PDF
      const header = pdfBuffer.slice(0, 4).toString();
      if (header === '%PDF') {
        console.log(`✅ PDF compiled via ${api.name}`);
        return pdfBuffer;
      }
      console.log(`⚠️ ${api.name} returned non-PDF response`);
    } catch (err) {
      console.log(`❌ ${api.name} failed:`, err.message);
    }
  }

  throw new Error('All LaTeX compilation APIs failed');
};

module.exports = { buildLatexCode, compileToPDF };
