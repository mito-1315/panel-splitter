const fs = require('fs');
const path = require('path');

function readHtmlFile(filePath) {
  const absolutePath = path.resolve(__dirname, filePath);
  return fs.readFileSync(absolutePath, 'utf8');
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function extractFirstNumber(text) {
  const match = String(text).match(/\d+/);
  return match ? match[0] : null;
}

function extractThemeText(text) {
  const raw = stripTags(text);
  // Try formats like: {Theme : X} or Theme : X
  let m = raw.match(/Theme\s*[:\-]\s*([^}]+)\}?/i);
  if (m && m[1]) return m[1].trim();
  // Fallback: if raw contains braces with key-value pairs
  m = raw.match(/\{[^}]*Theme\s*[:\-]\s*([^}]+)\}/i);
  if (m && m[1]) return m[1].trim();
  // Last resort: return the whole stripped text
  return raw;
}

function findNextTag(html, tagName, startIndex) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  regex.lastIndex = 0; // safety
  const slice = html.slice(startIndex);
  const m = slice.match(regex);
  if (!m) return null;
  const fullMatch = m[0];
  const inner = m[1] || '';
  const from = startIndex + m.index;
  const to = from + fullMatch.length;
  return { inner, from, to };
}

function* findAllProblemIdHeaders(html) {
  const thRegex = /<th[^>]*>\s*Problem\s*Statement\s*ID\s*<\/th>/gi;
  let m;
  while ((m = thRegex.exec(html)) !== null) {
    yield { from: m.index, to: m.index + m[0].length };
  }
}

function extractRows(html) {
  const rows = [];
  for (const pidTh of findAllProblemIdHeaders(html)) {
    // Next TD after Problem Statement ID
    const nextTdAfterPid = findNextTag(html, 'td', pidTh.to);
    if (!nextTdAfterPid) continue;
    const problemId = extractFirstNumber(stripTags(nextTdAfterPid.inner));
    if (!problemId) continue;

    // From after that TD, find the next TH with text "Theme"
    const sliceFrom = nextTdAfterPid.to;
    const themeThRegex = /<th[^>]*>\s*Theme\s*<\/th>/i;
    const themeThMatch = html.slice(sliceFrom).match(themeThRegex);
    if (!themeThMatch) {
      // Could not find a theme for this problem id; skip entry
      continue;
    }
    const themeThStart = sliceFrom + themeThMatch.index;
    const themeThEnd = themeThStart + themeThMatch[0].length;

    const themeTd = findNextTag(html, 'td', themeThEnd);
    if (!themeTd) continue;
    const theme = extractThemeText(themeTd.inner);
    if (!theme) continue;

    rows.push({ problemId, theme });
  }
  return rows;
}

function toCsv(rows) {
  const header = 'Problem Statement ID,Theme';
  const escapeCell = (value) => {
    const s = String(value);
    if (/[",\n]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = rows.map(r => `${escapeCell(r.problemId)},${escapeCell(r.theme)}`);
  return [header, ...lines].join('\n');
}

function writeCsv(filePath, csv) {
  const absolutePath = path.resolve(__dirname, filePath);
  fs.writeFileSync(absolutePath, csv, 'utf8');
}

function main() {
  const html = readHtmlFile('data.html');
  const rows = extractRows(html);
  if (rows.length === 0) {
    console.error('No rows extracted. Please verify the input format.');
  }
  const csv = toCsv(rows);
  writeCsv('themes.csv', csv);
  console.log(`Wrote ${rows.length} row(s) to themes.csv`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('Failed to extract themes:', err);
    process.exit(1);
  }
}


