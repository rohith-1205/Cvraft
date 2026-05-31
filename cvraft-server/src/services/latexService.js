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

// ── Font configurations ───────────────────────────────
const FONTS = {
  F001: {
    name: 'Computer Modern',
    package: '',  // LaTeX default
    cmd: ''
  },
  F002: {
    name: 'Helvetica',
    package: '\\usepackage[scaled]{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}',
    cmd: ''
  },
  F003: {
    name: 'Garamond',
    package: '\\usepackage{ebgaramond}',
    cmd: ''
  },
  F004: {
    name: 'Roboto',
    package: '\\usepackage[sfdefault]{roboto}',
    cmd: ''
  },
  F005: {
    name: 'Inconsolata',
    package: '\\usepackage{inconsolata}\n\\renewcommand{\\familydefault}{\\ttdefault}',
    cmd: ''
  }
};

// ── Color configurations ──────────────────────────────
const COLORS = {
  C001: { name: 'Classic Black',   hex: '000000' },
  C002: { name: 'Navy Blue',       hex: '1E3A5F' },
  C003: { name: 'Forest Green',    hex: '1B4332' },
  C004: { name: 'Burgundy',        hex: '6B2737' },
  C005: { name: 'Royal Purple',    hex: '3B0764' },
  C006: { name: 'Slate Gray',      hex: '2D3748' }
};

// ── Watermark helper ───────────────────────────────
const getWatermarkPreamble = (isWatermarked) => {
  if (!isWatermarked) return '';
  return `
\\usepackage{draftwatermark}
\\SetWatermarkText{PREVIEW ONLY}
\\SetWatermarkScale{3}
\\SetWatermarkColor[gray]{0.9}
`;
};

// ── T001 — Classic ───────────────────────────────────
const buildClassic = (data, font, color, isWatermarked = false) => {
  const name      = escapeLatex(data.name || '');
  const email     = escapeLatex(data.email || '');
  const phone     = escapeLatex(data.phone || '');
  const linkedin  = escapeLatex(data.linkedin || '');
  const github    = escapeLatex(data.github || '');
  const summary   = escapeLatex(data.summary || '');
  const hexColor  = color.hex;
  const watermark = getWatermarkPreamble(isWatermarked);

  let contactParts = [];
  if (phone)    contactParts.push(phone);
  if (email)    contactParts.push(`\\href{mailto:${email}}{\\underline{${email}}}`);
  if (linkedin) contactParts.push(`\\href{https://${linkedin}}{\\underline{linkedin}}`);
  if (github)   contactParts.push(`\\href{https://${github}}{\\underline{github}}`);
  const contactLine = contactParts.join(' $|$ ');

  let educationBlock = '';
  (data.education || []).forEach(edu => {
    educationBlock += `
  \\resumeSubheading
    {${escapeLatex(edu.college||'')}}{${escapeLatex(edu.year||'')}}
    {${escapeLatex(edu.degree||'')}}{CGPA: ${escapeLatex(edu.cgpa||'')}}`;
  });

  let experienceSection = '';
  if (data.experience && data.experience.length > 0) {
    experienceSection = `\\section{Experience}\n\\resumeSubHeadingListStart`;
    data.experience.forEach(exp => {
      experienceSection += `
  \\resumeSubheading
    {${escapeLatex(exp.role||'')}}{${escapeLatex(exp.duration||'')}}
    {${escapeLatex(exp.company||'')}}{}
  \\resumeItemListStart`;
      (exp.points||[]).forEach(p => {
        experienceSection += `\n    \\resumeItem{${escapeLatex(p)}}`;
      });
      experienceSection += `\n  \\resumeItemListEnd`;
    });
    experienceSection += `\n\\resumeSubHeadingListEnd`;
  }

  let projectsBlock = '';
  (data.projects||[]).forEach(proj => {
    projectsBlock += `
  \\resumeProjectHeading
    {\\textbf{${escapeLatex(proj.name||'')}} $|$ \\emph{${escapeLatex(proj.techStack||'')}}}{}
  \\resumeItemListStart`;
    (proj.points||[]).forEach(p => {
      projectsBlock += `\n    \\resumeItem{${escapeLatex(p)}}`;
    });
    projectsBlock += `\n  \\resumeItemListEnd`;
  });

  const languages  = escapeLatex((data.skills?.languages  ||[]).join(', '));
  const frameworks = escapeLatex((data.skills?.frameworks ||[]).join(', '));
  const tools      = escapeLatex((data.skills?.tools      ||[]).join(', '));

  let achievementsSection = '';
  if (data.achievements && data.achievements.length > 0) {
    achievementsSection = `\\section{Achievements}\n\\resumeItemListStart`;
    data.achievements.forEach(a => {
      achievementsSection += `\n  \\resumeItem{${escapeLatex(a)}}`;
    });
    achievementsSection += `\n\\resumeItemListEnd`;
  }

  return `\\documentclass[letterpaper,11pt]{article}
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
\\usepackage[table]{xcolor}
${font.package}

\\definecolor{themecolor}{HTML}{${hexColor}}

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
  \\vspace{-4pt}\\scshape\\raggedright\\large\\color{themecolor}
}{}{0em}{}[\\color{themecolor}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{\\item\\small{#1 \\vspace{-2pt}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{\\color{themecolor}#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeProjectHeading}[2]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\small#1 & #2 \\\\
  \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in,label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

${watermark}
\\begin{document}
\\begin{center}
  {\\Huge\\scshape\\color{themecolor} ${name}} \\\\ \\vspace{4pt}
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
\\begin{itemize}[leftmargin=0.15in,label={}]
  \\small{\\item{
    \\textbf{Languages}{: ${languages}} \\\\
    \\textbf{Frameworks}{: ${frameworks}} \\\\
    \\textbf{Tools}{: ${tools}}
  }}
\\end{itemize}

${achievementsSection}
\\end{document}`;
};

// ── T002 — Modern ────────────────────────────────────
const buildModern = (data, font, color, isWatermarked = false) => {
  const name = escapeLatex(data.name || '');
  const email = escapeLatex(data.email || '');
  const phone = escapeLatex(data.phone || '');
  const linkedin = escapeLatex(data.linkedin || '');
  const github = escapeLatex(data.github || '');
  const summary = escapeLatex(data.summary || '');
  const hexColor = color.hex;
  const watermark = getWatermarkPreamble(isWatermarked);

  let educationBlock = '';
  (data.education || []).forEach(edu => {
    educationBlock += `
\\textbf{${escapeLatex(edu.college || '')}} \\hfill ${escapeLatex(edu.year || '')} \\\\
\\textit{${escapeLatex(edu.degree || '')}} \\hfill CGPA: ${escapeLatex(edu.cgpa || '')} \\\\[4pt]`;
  });

  let experienceBlock = '';
  (data.experience || []).forEach(exp => {
    experienceBlock += `
\\textbf{${escapeLatex(exp.role || '')}} \\hfill \\textit{${escapeLatex(exp.duration || '')}} \\\\
\\textit{${escapeLatex(exp.company || '')}} \\\\
\\begin{itemize}[leftmargin=*, noitemsep, topsep=2pt]`;
    (exp.points || []).forEach(p => {
      experienceBlock += `\n  \\item \\small ${escapeLatex(p)}`;
    });
    experienceBlock += `\n\\end{itemize}\\vspace{4pt}`;
  });

  let projectsBlock = '';
  (data.projects || []).forEach(proj => {
    projectsBlock += `
\\textbf{${escapeLatex(proj.name || '')}} \\hfill \\textit{${escapeLatex(proj.techStack || '')}} \\\\
\\begin{itemize}[leftmargin=*, noitemsep, topsep=2pt]`;
    (proj.points || []).forEach(p => {
      projectsBlock += `\n  \\item \\small ${escapeLatex(p)}`;
    });
    projectsBlock += `\n\\end{itemize}\\vspace{4pt}`;
  });

  const languages  = escapeLatex((data.skills?.languages  || []).join(', '));
  const frameworks = escapeLatex((data.skills?.frameworks || []).join(', '));
  const tools      = escapeLatex((data.skills?.tools      || []).join(', '));

  let achievementsBlock = '';
  if (data.achievements && data.achievements.length > 0) {
    achievementsBlock = `\\section*{Achievements}
\\rule{\\linewidth}{0.4pt}\\\\[4pt]
\\begin{itemize}[leftmargin=*, noitemsep]`;
    data.achievements.forEach(a => {
      achievementsBlock += `\n  \\item \\small ${escapeLatex(a)}`;
    });
    achievementsBlock += `\n\\end{itemize}`;
  }

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\usepackage{xcolor}
${font.package}

\\definecolor{themecolor}{HTML}{${hexColor}}

\\titleformat{\\section}{\\large\\bfseries\\color{themecolor}}{}{0em}{}[\\color{themecolor}\\titlerule]
\\titlespacing{\\section}{0pt}{8pt}{4pt}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

${watermark}
\\begin{document}

% HEADER
{\\Huge\\bfseries\\color{themecolor} ${name}}\\\\[4pt]
\\color{themecolor}\\rule{\\linewidth}{1.5pt}\\\\[2pt]
\\color{black}
\\small
${phone ? phone + ' $\\cdot$ ' : ''}
${email ? `\\href{mailto:${email}}{${email}}` : ''}
${linkedin ? ` $\\cdot$ \\href{https://${linkedin}}{LinkedIn}` : ''}
${github ? ` $\\cdot$ \\href{https://${github}}{GitHub}` : ''}
\\\\[6pt]

\\section*{Professional Summary}
\\rule{\\linewidth}{0.4pt}\\\\[4pt]
\\small ${summary}

\\section*{Education}
\\rule{\\linewidth}{0.4pt}\\\\[4pt]
${educationBlock}

\\section*{Experience}
\\rule{\\linewidth}{0.4pt}\\\\[4pt]
${experienceBlock}

\\section*{Projects}
\\rule{\\linewidth}{0.4pt}\\\\[4pt]
${projectsBlock}

\\section*{Technical Skills}
\\rule{\\linewidth}{0.4pt}\\\\[4pt]
\\small
\\textbf{Languages:} ${languages} \\\\
\\textbf{Frameworks:} ${frameworks} \\\\
\\textbf{Tools:} ${tools}

${achievementsBlock}

\\end{document}`;
};

// ── T003 — Minimal ───────────────────────────────────
const buildMinimal = (data, font, color, isWatermarked = false) => {
  const name = escapeLatex(data.name || '');
  const email = escapeLatex(data.email || '');
  const phone = escapeLatex(data.phone || '');
  const linkedin = escapeLatex(data.linkedin || '');
  const github = escapeLatex(data.github || '');
  const summary = escapeLatex(data.summary || '');
  const hexColor = color.hex;
  const watermark = getWatermarkPreamble(isWatermarked);

  let educationBlock = '';
  (data.education || []).forEach(edu => {
    educationBlock += `\\textbf{${escapeLatex(edu.degree || '')}} — ${escapeLatex(edu.college || '')} \\hfill ${escapeLatex(edu.year || '')}\\\\
CGPA: ${escapeLatex(edu.cgpa || '')}\\\\[6pt]`;
  });

  let experienceBlock = '';
  (data.experience || []).forEach(exp => {
    experienceBlock += `\\textbf{${escapeLatex(exp.role || '')}} at ${escapeLatex(exp.company || '')} \\hfill ${escapeLatex(exp.duration || '')}
\\begin{itemize}[leftmargin=1.5em, noitemsep, topsep=2pt]`;
    (exp.points || []).forEach(p => {
      experienceBlock += `\n  \\item \\small ${escapeLatex(p)}`;
    });
    experienceBlock += `\n\\end{itemize}\\vspace{6pt}`;
  });

  let projectsBlock = '';
  (data.projects || []).forEach(proj => {
    projectsBlock += `\\textbf{${escapeLatex(proj.name || '')}} \\small{(${escapeLatex(proj.techStack || '')})}
\\begin{itemize}[leftmargin=1.5em, noitemsep, topsep=2pt]`;
    (proj.points || []).forEach(p => {
      projectsBlock += `\n  \\item \\small ${escapeLatex(p)}`;
    });
    projectsBlock += `\n\\end{itemize}\\vspace{6pt}`;
  });

  const languages  = escapeLatex((data.skills?.languages  || []).join(' · '));
  const frameworks = escapeLatex((data.skills?.frameworks || []).join(' · '));
  const tools      = escapeLatex((data.skills?.tools      || []).join(' · '));

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[top=1in,bottom=1in,left=1.2in,right=1.2in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{xcolor}
${font.package}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\definecolor{themecolor}{HTML}{${hexColor}}

${watermark}
\\begin{document}

% NAME
{\\LARGE\\bfseries\\color{themecolor} ${name}}\\\\[2pt]
\\small
${phone ? phone + ' · ' : ''}${email ? `\\href{mailto:${email}}{${email}}` : ''}${linkedin ? ' · ' + linkedin : ''}${github ? ' · ' + github : ''}
\\\\[12pt]
\\color{themecolor}\\hrule
\\vspace{10pt}
\\color{black}

${summary}\\\\[10pt]
\\color{themecolor}\\hrule
\\vspace{10pt}
\\color{black}

{\\large\\bfseries\\color{themecolor} Education}\\\\[6pt]
${educationBlock}
\\color{themecolor}\\hrule
\\vspace{10pt}
\\color{black}

{\\large\\bfseries\\color{themecolor} Experience}\\\\[6pt]
${experienceBlock}
\\color{themecolor}\\hrule
\\vspace{10pt}
\\color{black}

{\\large\\bfseries\\color{themecolor} Projects}\\\\[6pt]
${projectsBlock}
\\color{themecolor}\\hrule
\\vspace{10pt}
\\color{black}

{\\large\\bfseries\\color{themecolor} Skills}\\\\[6pt]
\\small
\\textbf{Languages:} ${languages}\\\\
\\textbf{Frameworks:} ${frameworks}\\\\
\\textbf{Tools:} ${tools}

\\end{document}`;
};

// ── T004 — ATS Pro ───────────────────────────────────
const buildATS = (data, font, color, isWatermarked = false) => {
  const name = escapeLatex(data.name || '');
  const email = escapeLatex(data.email || '');
  const phone = escapeLatex(data.phone || '');
  const linkedin = escapeLatex(data.linkedin || '');
  const github = escapeLatex(data.github || '');
  const summary = escapeLatex(data.summary || '');
  const hexColor = color.hex;
  const watermark = getWatermarkPreamble(isWatermarked);

  let educationBlock = '';
  (data.education || []).forEach(edu => {
    educationBlock += `\\textbf{${escapeLatex(edu.college || '')}}\\\\
${escapeLatex(edu.degree || '')} | CGPA: ${escapeLatex(edu.cgpa || '')} | ${escapeLatex(edu.year || '')}\\\\[4pt]`;
  });

  let experienceBlock = '';
  (data.experience || []).forEach(exp => {
    experienceBlock += `\\textbf{${escapeLatex(exp.role || '')}} | ${escapeLatex(exp.company || '')} | ${escapeLatex(exp.duration || '')}\\\\
\\begin{itemize}[leftmargin=*, noitemsep, topsep=1pt]`;
    (exp.points || []).forEach(p => {
      experienceBlock += `\n\\item ${escapeLatex(p)}`;
    });
    experienceBlock += `\n\\end{itemize}\\vspace{4pt}`;
  });

  let projectsBlock = '';
  (data.projects || []).forEach(proj => {
    projectsBlock += `\\textbf{${escapeLatex(proj.name || '')}} | ${escapeLatex(proj.techStack || '')}\\\\
\\begin{itemize}[leftmargin=*, noitemsep, topsep=1pt]`;
    (proj.points || []).forEach(p => {
      projectsBlock += `\n\\item ${escapeLatex(p)}`;
    });
    projectsBlock += `\n\\end{itemize}\\vspace{4pt}`;
  });

  const allSkills = [
    ...(data.skills?.languages  || []),
    ...(data.skills?.frameworks || []),
    ...(data.skills?.tools      || [])
  ].map(escapeLatex).join(', ');

  let achievementsBlock = '';
  if (data.achievements && data.achievements.length > 0) {
    achievementsBlock = `ACHIEVEMENTS\\\\
\\begin{itemize}[leftmargin=*, noitemsep]`;
    data.achievements.forEach(a => {
      achievementsBlock += `\n\\item ${escapeLatex(a)}`;
    });
    achievementsBlock += `\n\\end{itemize}\\\\[6pt]`;
  }

  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}
${font.package}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\usepackage{parskip}

\\definecolor{themecolor}{HTML}{${hexColor}}

${watermark}
\\begin{document}

{\\LARGE\\bfseries\\color{themecolor} ${name}}\\\\
${phone} | \\href{mailto:${email}}{${email}} | ${linkedin} | ${github}\\\\
\\color{themecolor}\\noindent\\rule{\\linewidth}{0.8pt}
\\color{black}

SUMMARY\\\\
\\small ${summary}\\\\[4pt]
\\color{themecolor}\\noindent\\rule{\\linewidth}{0.4pt}
\\color{black}

EDUCATION\\\\
${educationBlock}
\\color{themecolor}\\noindent\\rule{\\linewidth}{0.4pt}
\\color{black}

EXPERIENCE\\\\
${experienceBlock}
\\color{themecolor}\\noindent\\rule{\\linewidth}{0.4pt}
\\color{black}

PROJECTS\\\\
${projectsBlock}
\\color{themecolor}\\noindent\\rule{\\linewidth}{0.4pt}
\\color{black}

TECHNICAL SKILLS\\\\
${allSkills}\\\\[4pt]
\\color{themecolor}\\noindent\\rule{\\linewidth}{0.4pt}
\\color{black}

${achievementsBlock}

\\end{document}`;
};

// ── T005 — Academic ──────────────────────────────────
const buildAcademic = (data, font, color, isWatermarked = false) => {
  const name = escapeLatex(data.name || '');
  const email = escapeLatex(data.email || '');
  const phone = escapeLatex(data.phone || '');
  const linkedin = escapeLatex(data.linkedin || '');
  const github = escapeLatex(data.github || '');
  const summary = escapeLatex(data.summary || '');
  const hexColor = color.hex;
  const watermark = getWatermarkPreamble(isWatermarked);

  let educationBlock = '';
  (data.education || []).forEach(edu => {
    educationBlock += `\\item \\textbf{${escapeLatex(edu.degree || '')}}, ${escapeLatex(edu.college || '')}, ${escapeLatex(edu.year || '')}. CGPA: ${escapeLatex(edu.cgpa || '')}`;
  });

  let experienceBlock = '';
  (data.experience || []).forEach(exp => {
    experienceBlock += `\\item \\textbf{${escapeLatex(exp.role || '')}}, \\textit{${escapeLatex(exp.company || '')}}, ${escapeLatex(exp.duration || '')}
\\begin{itemize}[noitemsep, topsep=2pt]`;
    (exp.points || []).forEach(p => {
      experienceBlock += `\n  \\item ${escapeLatex(p)}`;
    });
    experienceBlock += `\n\\end{itemize}`;
  });

  let projectsBlock = '';
  (data.projects || []).forEach(proj => {
    projectsBlock += `\\item \\textbf{${escapeLatex(proj.name || '')}} (${escapeLatex(proj.techStack || '')})
\\begin{itemize}[noitemsep, topsep=2pt]`;
    (proj.points || []).forEach(p => {
      projectsBlock += `\n  \\item ${escapeLatex(p)}`;
    });
    projectsBlock += `\n\\end{itemize}`;
  });

  const languages  = escapeLatex((data.skills?.languages  || []).join(', '));
  const frameworks = escapeLatex((data.skills?.frameworks || []).join(', '));
  const tools      = escapeLatex((data.skills?.tools      || []).join(', '));

  let achievementsBlock = '';
  if (data.achievements && data.achievements.length > 0) {
    achievementsBlock = `\\subsection*{Honours \\& Awards}
\\begin{itemize}[noitemsep]`;
    data.achievements.forEach(a => {
      achievementsBlock += `\n  \\item ${escapeLatex(a)}`;
    });
    achievementsBlock += `\n\\end{itemize}`;
  }

  let certificationsBlock = '';
  if (data.certifications && data.certifications.length > 0) {
    certificationsBlock = `\\subsection*{Certifications}
\\begin{itemize}[noitemsep]`;
    data.certifications.forEach(c => {
      certificationsBlock += `\n  \\item ${escapeLatex(c)}`;
    });
    certificationsBlock += `\n\\end{itemize}`;
  }

  return `\\documentclass[12pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\usepackage{parskip}
\\usepackage{xcolor}
${font.package}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\definecolor{themecolor}{HTML}{${hexColor}}

\\titleformat{\\section}{\\large\\scshape\\color{themecolor}}{}{0em}{}[\\color{themecolor}\\titlerule]
\\titleformat{\\subsection}{\\normalsize\\bfseries\\color{themecolor}}{}{0em}{}

${watermark}
\\begin{document}

\\begin{center}
  {\\huge\\bfseries\\scshape\\color{themecolor} ${name}}\\\\[4pt]
  \\small ${phone ? phone + ' $\\bullet$ ' : ''}
  \\href{mailto:${email}}{${email}}
  ${linkedin ? ' $\\bullet$ \\href{https://' + linkedin + '}{LinkedIn}' : ''}
  ${github ? ' $\\bullet$ \\href{https://' + github + '}{GitHub}' : ''}
\\end{center}
\\vspace{4pt}
\\color{themecolor}\\hrule
\\color{black}
\\vspace{8pt}

\\section*{Research Interest / Summary}
${summary}

\\section*{Education}
\\begin{itemize}[leftmargin=*, noitemsep]
${educationBlock}
\\end{itemize}

\\section*{Research \\& Work Experience}
\\begin{itemize}[leftmargin=*, noitemsep]
${experienceBlock}
\\end{itemize}

\\section*{Projects \\& Publications}
\\begin{itemize}[leftmargin=*, noitemsep]
${projectsBlock}
\\end{itemize}

\\section*{Technical Skills}
\\textbf{Languages:} ${languages}\\\\
\\textbf{Frameworks:} ${frameworks}\\\\
\\textbf{Tools:} ${tools}

${achievementsBlock}
${certificationsBlock}

\\end{document}`;
};

// ── Build LaTeX code from JSON data ──────────────────
const buildLatexCode = (data, templateId = 'T001', fontId = 'F001', colorId = 'C001', isWatermarked = false) => {
  console.log(`🎨 Template: ${templateId} | Font: ${fontId} | Color: ${colorId} | Watermarked: ${isWatermarked}`);

  const font  = FONTS[fontId]  || FONTS.F001;
  const color = COLORS[colorId] || COLORS.C001;

  switch(templateId) {
    case 'T002': return buildModern(data, font, color, isWatermarked);
    case 'T003': return buildMinimal(data, font, color, isWatermarked);
    case 'T004': return buildATS(data, font, color, isWatermarked);
    case 'T005': return buildAcademic(data, font, color, isWatermarked);
    default:     return buildClassic(data, font, color, isWatermarked);
  }
};

// ── Compile LaTeX → PDF ───────────────────────────────
const compileToPDF = async (latexCode) => {
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

const buildCoverLetterLatex = (data, bodyText, fontId = 'F001', colorId = 'C001') => {
  const font  = FONTS[fontId]  || FONTS.F001;
  const color = COLORS[colorId] || COLORS.C001;

  const name     = escapeLatex(data.name || '');
  const email    = escapeLatex(data.email || '');
  const phone    = escapeLatex(data.phone || '');
  const linkedin = escapeLatex(data.linkedin || '');
  const github   = escapeLatex(data.github || '');
  const hexColor = color.hex;

  // Process the body text: split by newlines, trim, filter, escape, and join
  const escapedBody = bodyText
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => escapeLatex(p))
    .join('\n\n');

  let contactParts = [];
  if (phone)    contactParts.push(phone);
  if (email)    contactParts.push(`\\href{mailto:${email}}{\\underline{${email}}}`);
  if (linkedin) contactParts.push(`\\href{https://${linkedin}}{\\underline{linkedin}}`);
  if (github)   contactParts.push(`\\href{https://${github}}{\\underline{github}}`);
  const contactLine = contactParts.join(' $|$ ');

  return `\\documentclass[letterpaper,11pt]{article}
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
\\usepackage[table]{xcolor}
${font.package}

\\definecolor{themecolor}{HTML}{${hexColor}}

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

\\begin{document}
\\begin{center}
  {\\Huge\\scshape\\color{themecolor} ${name}} \\\\ \\vspace{4pt}
  \\small ${contactLine}
\\end{center}

\\vspace{20pt}

\\hfill \\today

\\vspace{10pt}
\\textbf{Subject: Application for Professional Opportunities}

\\vspace{15pt}
Dear Hiring Manager,

${escapedBody}

\\vspace{15pt}
Sincerely,

\\vspace{20pt}
\\textbf{${name}}
\\end{document}`;
};

const buildInvoiceLatex = (payment, user) => {
  const invoiceNumber = escapeLatex(payment.razorpayPaymentId || `INV-${payment._id.toString().slice(-6).toUpperCase()}`);
  const invoiceDate = new Date(payment.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const customerName = escapeLatex(user.name || 'Client');
  const customerEmail = escapeLatex(user.email || '');
  const transactionId = escapeLatex(payment.razorpayPaymentId || 'N/A');
  const orderId = escapeLatex(payment.razorpayOrderId || 'N/A');
  const planName = payment.plan.toUpperCase();
  const amountStr = `INR ${(payment.amount / 100).toFixed(2)}`;

  return `\\documentclass[letterpaper,11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage[table]{xcolor}
\\usepackage[hidelinks]{hyperref}

\\definecolor{primary}{HTML}{1E3A8A}
\\definecolor{secondary}{HTML}{475569}
\\definecolor{light}{HTML}{F8FAFC}

\\pagestyle{empty}

\\begin{document}

\\noindent
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  {\\Huge\\bfseries\\color{primary} CVRAFT} & {\\Huge\\bfseries INVOICE} \\\\
  {\\small Beautifully Crafted Resumes} & {\\small Invoice No: \\textbf{${invoiceNumber}}} \\\\
  {\\small synchabit@gmail.com} & {\\small Date: \\textbf{${invoiceDate}}}
\\end{tabular*}

\\vspace{30pt}

\\noindent
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  {\\large\\bfseries\\color{primary} Billed To:} & {\\large\\bfseries\\color{primary} Provider Info:} \\\\
  \\textbf{${customerName}} & CVRAFT \\\\
  Email: ${customerEmail} & Email: synchabit@gmail.com \\\\
  & Web: cvraft.com
\\end{tabular*}

\\vspace{30pt}

\\noindent
{\\large\\bfseries\\color{primary} Payment Method:} \\\\
Razorpay Transaction: \\textbf{${transactionId}} \\\\
Order ID: \\textbf{${orderId}}

\\vspace{30pt}

\\noindent
\\renewcommand{\\arraystretch}{1.5}
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}rr}
  \\rowcolor{primary} \\textcolor{white}{\\bfseries Description} & \\textcolor{white}{\\bfseries Qty} & \\textcolor{white}{\\bfseries Price} \\\\
  CVRAFT Resume Builder - ${planName} & 1 & ${amountStr} \\\\
  \\hline
  & \\textbf{Subtotal:} & ${amountStr} \\\\
  & \\textbf{Tax (0\\%):} & INR 0.00 \\\\
  \\rowcolor{light} & \\textbf{Total Paid:} & ${amountStr} \\\\
\\end{tabular*}

\\vspace{80pt}
\\begin{center}
  {\\small\\color{secondary} Thank you for using CVRAFT! If you have any questions, contact us at synchabit@gmail.com.}
\\end{center}

\\end{document}`;
};

module.exports = { buildLatexCode, compileToPDF, buildCoverLetterLatex, buildInvoiceLatex, FONTS, COLORS };
