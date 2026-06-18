/**
 * @module services/pdf
 * @description PDF generation service. Uses local Chrome on Windows/dev
 * and @sparticuz/chromium on Linux/Render (serverless).
 */

const puppeteer = require('puppeteer-core');

// ─────────────────────────────────────────────────────────────
//  BROWSER MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * Find a local Chrome/Chromium executable path on Windows.
 * @returns {string|null}
 */
function findLocalChrome() {
  const fs = require('fs');
  const paths = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    // Mac paths
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // Linux paths
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);

  for (const p of paths) {
    try { if (fs.existsSync(p)) return p; } catch (_) { /* ignore */ }
  }
  return null;
}

/**
 * Launch a Chromium browser instance.
 * Uses @sparticuz/chromium in production/Linux, local Chrome in dev/Windows.
 * @returns {Promise<import('puppeteer-core').Browser>}
 */
async function getBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLinux = process.platform === 'linux';

  if (isProduction || isLinux) {
    // Serverless / Render
    const chromium = require('@sparticuz/chromium');
    return puppeteer.launch({
      args: [...chromium.args, '--disable-gpu', '--single-process'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  // Local development (Windows/Mac)
  const executablePath = findLocalChrome();
  if (!executablePath) {
    throw new Error(
      'No Chrome/Edge found. Install Chrome or set CHROME_PATH environment variable.'
    );
  }

  return puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
}

// ─────────────────────────────────────────────────────────────
//  RESUME PDF
// ─────────────────────────────────────────────────────────────

/**
 * Generate an ATS-friendly resume PDF from enhanced resume content.
 * @param {Object} content - Enhanced resume data (from Gemini)
 * @returns {Promise<Buffer>} PDF file buffer
 */
async function generateResumePDF(content) {
  const html = buildResumeHTML(content);
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Build clean, ATS-friendly HTML for resume PDF rendering.
 * @param {Object} c - Enhanced resume content
 * @returns {string} Complete HTML document
 */
function buildResumeHTML(c) {
  const experienceHTML = (c.experience || []).map(exp => `
    <div style="margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <div>
          <span style="font-weight: 600; font-size: 13px; color: #1a1a2e;">${exp.title}</span>
          <span style="color: #555; font-size: 12px;"> — ${exp.company}${exp.location ? `, ${exp.location}` : ''}</span>
        </div>
        <span style="font-size: 11px; color: #777; white-space: nowrap;">${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}</span>
      </div>
      <ul style="margin: 4px 0 0 18px; padding: 0; font-size: 11.5px; color: #333; line-height: 1.6;">
        ${(exp.bullets || []).map(b => `<li style="margin-bottom: 2px;">${b}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const educationHTML = (c.education || []).map(edu => `
    <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
      <div>
        <span style="font-weight: 600; font-size: 12px; color: #1a1a2e;">${edu.degree}</span>
        <span style="color: #555; font-size: 12px;"> — ${edu.institution}</span>
        ${edu.gpa ? `<span style="color: #777; font-size: 11px;"> (GPA: ${edu.gpa})</span>` : ''}
      </div>
      <span style="font-size: 11px; color: #777;">${edu.year}</span>
    </div>
  `).join('');

  const projectsHTML = (c.projects || []).map(proj => `
    <div style="margin-bottom: 10px;">
      <span style="font-weight: 600; font-size: 12px; color: #1a1a2e;">${proj.name}</span>
      ${proj.link ? `<span style="font-size: 11px; color: #6366f1;"> — ${proj.link}</span>` : ''}
      <div style="font-size: 11.5px; color: #333; margin-top: 2px;">${proj.description}</div>
      ${proj.technologies?.length ? `<div style="font-size: 11px; color: #555; margin-top: 2px;">Tech: ${proj.technologies.join(', ')}</div>` : ''}
    </div>
  `).join('');

  const contactParts = [c.email, c.phone, c.linkedin, c.github, c.portfolio].filter(Boolean);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5; }
    .section-title {
      font-size: 13px; font-weight: 700; color: #1a1a2e; text-transform: uppercase;
      letter-spacing: 1.2px; border-bottom: 2px solid #6366f1; padding-bottom: 4px;
      margin: 16px 0 10px 0;
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 6px;">
    <h1 style="font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px;">${c.fullName || 'Your Name'}</h1>
    <div style="font-size: 11px; color: #555;">${contactParts.join('  •  ')}</div>
  </div>

  ${c.summary ? `
  <div class="section-title">Professional Summary</div>
  <p style="font-size: 11.5px; color: #333; line-height: 1.6;">${c.summary}</p>
  ` : ''}

  ${(c.experience || []).length ? `
  <div class="section-title">Experience</div>
  ${experienceHTML}
  ` : ''}

  ${(c.education || []).length ? `
  <div class="section-title">Education</div>
  ${educationHTML}
  ` : ''}

  ${(c.skills || []).length ? `
  <div class="section-title">Skills</div>
  <p style="font-size: 11.5px; color: #333;">${c.skills.join('  •  ')}</p>
  ` : ''}

  ${(c.projects || []).length ? `
  <div class="section-title">Projects</div>
  ${projectsHTML}
  ` : ''}

  ${(c.certifications || []).filter(Boolean).length ? `
  <div class="section-title">Certifications</div>
  <ul style="margin-left: 18px; font-size: 11.5px; color: #333;">
    ${c.certifications.filter(Boolean).map(cert => `<li>${cert}</li>`).join('')}
  </ul>
  ` : ''}
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
//  REPORT PDF
// ─────────────────────────────────────────────────────────────

/**
 * Generate a styled interview report PDF from AI analysis data.
 * @param {Object} report - Full interview data including aiReport
 * @returns {Promise<Buffer>} PDF file buffer
 */
async function generateReportPDF(report) {
  const html = buildReportHTML(report);
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Build styled HTML for interview report PDF.
 * @param {Object} r - Interview document with aiReport
 * @returns {string} Complete HTML document
 */
function buildReportHTML(r) {
  const ai = r.aiReport || {};
  const severityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const difficultyColors = { hard: '#ef4444', medium: '#f59e0b', easy: '#10b981' };

  const technicalHTML = (ai.technicalQuestions || []).map((q, i) => `
    <div style="margin-bottom: 14px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid ${difficultyColors[q.difficulty] || '#6366f1'};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: 600; font-size: 12px; color: #1a1a2e;">Q${i + 1}. ${q.question}</span>
        <span style="font-size: 10px; padding: 2px 8px; border-radius: 12px; background: ${difficultyColors[q.difficulty]}22; color: ${difficultyColors[q.difficulty]}; font-weight: 600; text-transform: uppercase;">${q.difficulty}</span>
      </div>
      <div style="font-size: 10px; color: #6366f1; margin-bottom: 4px;">Topic: ${q.topic}</div>
      <div style="font-size: 11px; color: #444; line-height: 1.5;">${q.expectedAnswer}</div>
    </div>
  `).join('');

  const behavioralHTML = (ai.behavioralStrategies || []).map(s => `
    <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px; page-break-inside: avoid;">
      <div style="font-weight: 600; font-size: 12px; color: #1a1a2e; margin-bottom: 8px;">${s.question}</div>
      <div style="font-size: 11px; line-height: 1.5;">
        <div style="margin-bottom: 4px; padding-left: 10px; border-left: 3px solid #6366f1;"><strong>Situation:</strong> ${s.situation}</div>
        <div style="margin-bottom: 4px; padding-left: 10px; border-left: 3px solid #818cf8;"><strong>Task:</strong> ${s.task}</div>
        <div style="margin-bottom: 4px; padding-left: 10px; border-left: 3px solid #a78bfa;"><strong>Action:</strong> ${s.action}</div>
        <div style="margin-bottom: 4px; padding-left: 10px; border-left: 3px solid #10b981;"><strong>Result:</strong> ${s.result}</div>
      </div>
      <div style="font-size: 10.5px; color: #6366f1; margin-top: 6px;">💡 ${s.tip}</div>
    </div>
  `).join('');

  const skillGapHTML = (ai.skillGapAnalysis || []).map(g => `
    <tr>
      <td style="padding: 8px 12px; font-weight: 500; font-size: 11.5px;">${g.skill}</td>
      <td style="padding: 8px 12px; text-align: center;">
        <span style="font-size: 10px; padding: 2px 10px; border-radius: 12px; background: ${severityColors[g.severity]}22; color: ${severityColors[g.severity]}; font-weight: 600; text-transform: uppercase;">${g.severity}</span>
      </td>
      <td style="padding: 8px 12px; font-size: 11px; color: #555;">${g.currentLevel}</td>
      <td style="padding: 8px 12px; font-size: 11px; color: #333;">${g.recommendation}</td>
    </tr>
  `).join('');

  const roadmapHTML = (ai.preparationRoadmap || []).map(day => `
    <div style="margin-bottom: 14px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #6366f1; page-break-inside: avoid;">
      <div style="font-weight: 700; font-size: 13px; color: #6366f1; margin-bottom: 4px;">Day ${day.day}: ${day.focusArea}</div>
      <div style="font-size: 11px; margin-bottom: 4px;">
        <strong>Tasks:</strong>
        <ul style="margin: 2px 0 0 16px; padding: 0;">${(day.tasks || []).map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
      <div style="font-size: 11px;">
        <strong>Resources:</strong>
        <ul style="margin: 2px 0 0 16px; padding: 0;">${(day.resources || []).map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
    </div>
  `).join('');

  const scoreColor = (r.matchScore || 0) >= 70 ? '#10b981' : (r.matchScore || 0) >= 40 ? '#f59e0b' : '#ef4444';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5; }
    h2 { font-size: 16px; color: #1a1a2e; border-bottom: 2px solid #6366f1; padding-bottom: 4px; margin: 24px 0 12px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #6366f1; color: white; padding: 8px 12px; text-align: left; font-size: 11px; }
    td { border-bottom: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; margin-bottom: 20px;">
    <h1 style="font-size: 22px; color: white; margin-bottom: 4px;">Interview Preparation Report</h1>
    <div style="color: rgba(255,255,255,0.9); font-size: 13px;">${r.jobTitle || 'Role'}${r.company ? ` at ${r.company}` : ''}</div>
    <div style="margin-top: 12px; display: inline-block; width: 60px; height: 60px; border-radius: 50%; background: white; line-height: 60px; text-align: center;">
      <span style="font-size: 20px; font-weight: 700; color: ${scoreColor};">${r.matchScore || 0}%</span>
    </div>
    <div style="color: rgba(255,255,255,0.8); font-size: 11px; margin-top: 4px;">Match Score</div>
  </div>

  ${ai.executiveSummary ? `
  <h2>Executive Summary</h2>
  <p style="font-size: 12px; line-height: 1.7; color: #444;">${ai.executiveSummary}</p>
  ` : ''}

  <h2>Technical Interview Questions</h2>
  ${technicalHTML}

  <h2>Behavioral Strategies (STAR Method)</h2>
  ${behavioralHTML}

  <h2>Skill Gap Analysis</h2>
  <table>
    <thead><tr><th>Skill</th><th>Severity</th><th>Current Level</th><th>Recommendation</th></tr></thead>
    <tbody>${skillGapHTML}</tbody>
  </table>

  <h2>7-Day Preparation Roadmap</h2>
  ${roadmapHTML}

  <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 10px;">
    Generated by PrepAI • ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
</body>
</html>`;
}

module.exports = {
  generateResumePDF,
  generateReportPDF,
};
