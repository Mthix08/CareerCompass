const fs = require('fs');
const path = require('path');
for (const file of fs.readdirSync(path.join(__dirname, 'data')).filter(x => x.endsWith('.json')).sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', file), 'utf8'));
  const hits = [];
  const patterns = [
    [/\b([A-Za-z]{3,})(?:\s+\1)\b/gi, 'repeated word'],
    [/\b(?:th|teh|adn|wiht|requriements|qualifcation)\b/gi, 'typo'],
    [/(?:Ã.|Â.|â[€™“”–—]|�)/g, 'encoding'],
    [/[\u0080-\u009f]/g, 'control character'],
    [/([A-Za-z]{4,})\1\b/gi, 'joined duplicate'],
    [/\s{2,}/g, 'extra spaces'],
  ];
  function walk(v, loc = '') {
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${loc}[${i}]`));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, `${loc}.${k}`));
    else if (typeof v === 'string') for (const [regex, label] of patterns) {
      for (const m of v.matchAll(regex)) hits.push([loc, label, v.slice(Math.max(0, m.index - 35), m.index + m[0].length + 40).replace(/\n/g, ' ')]);
    }
  }
  walk(data);
  const courses = Array.isArray(data.courses) ? data.courses : [];
  const counts = new Map();
  for (const c of courses) if (c && c.name) counts.set(c.name.trim().toLowerCase(), (counts.get(c.name.trim().toLowerCase()) || 0) + 1);
  const dup = [...counts].filter(([, n]) => n > 1);
  console.log(`\n${file}: ${courses.length} courses, ${hits.length} text hits, ${dup.length} duplicate names`);
  hits.slice(0, 45).forEach(x => console.log('  ', ...x));
  dup.slice(0, 10).forEach(x => console.log('  DUP', ...x));
}
