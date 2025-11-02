#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const colorsFile = path.join(root, 'design-system', 'colors.ts');

function parsePalette(fileContent) {
  const groups = {};
  const groupRegex = /(\w+)\s*:\s*\{([^}]+)\}/g;
  let m;
  while ((m = groupRegex.exec(fileContent)) !== null) {
    const group = m[1];
    const body = m[2];
    const shadeRegex = /(\d+)\s*:\s*['"](#(?:[0-9A-Fa-f]{6,8}))['"]/g;
    let s;
    groups[group] = groups[group] || {};
    while ((s = shadeRegex.exec(body)) !== null) {
      const shade = s[1];
      const hex = s[2].toLowerCase();
      groups[group][shade] = hex;
    }
  }
  return groups;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b];
}

function rgbDistance(a, b) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}

function buildFlatPalette(groups) {
  const flat = [];
  for (const group of Object.keys(groups)) {
    for (const shade of Object.keys(groups[group])) {
      const hex = groups[group][shade];
      flat.push({ group, shade, hex, rgb: hexToRgb(hex) });
    }
  }
  return flat;
}

function parseColorString(str) {
  str = str.trim();
  // hex
  const hexMatch = str.match(/#([0-9A-Fa-f]{6,8})/);
  if (hexMatch) return { type: 'hex', hex: '#' + hexMatch[1] };

  // rgb/rgba
  const rgbMatch = str.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map(s=>s.trim());
    const r = parseInt(parts[0]);
    const g = parseInt(parts[1]);
    const b = parseInt(parts[2]);
    const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    return { type: 'rgb', rgb: [r,g,b], alpha: a };
  }

  // hsl/hsla
  const hslMatch = str.match(/hsla?\(([^)]+)\)/i);
  if (hslMatch) {
    const parts = hslMatch[1].split(',').map(s=>s.trim());
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1].replace('%',''))/100;
    const l = parseFloat(parts[2].replace('%',''))/100;
    const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    // convert hsl to rgb
    const c = (1 - Math.abs(2*l -1)) * s;
    const x = c * (1 - Math.abs((h/60)%2 -1));
    const m = l - c/2;
    let r1=0,g1=0,b1=0;
    if (0<=h && h<60) { r1=c; g1=x; b1=0 }
    else if (60<=h && h<120) { r1=x; g1=c; b1=0 }
    else if (120<=h && h<180) { r1=0; g1=c; b1=x }
    else if (180<=h && h<240) { r1=0; g1=x; b1=c }
    else if (240<=h && h<300) { r1=x; g1=0; b1=c }
    else { r1=c; g1=0; b1=x }
    const r = Math.round((r1+m)*255);
    const g = Math.round((g1+m)*255);
    const b = Math.round((b1+m)*255);
    return { type: 'rgb', rgb: [r,g,b], alpha: a };
  }

  // named colors (common ones)
  const name = str.toLowerCase();
  const named = {
    white: [255,255,255],
    black: [0,0,0],
    transparent: null,
    red: [255,0,0],
    blue: [0,0,255],
    gray: [128,128,128],
    grey: [128,128,128],
  };
  if (name in named) {
    if (named[name] === null) return { type: 'transparent' };
    return { type: 'rgb', rgb: named[name], alpha: 1 };
  }

  return null;
}

function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build'].includes(e.name)) continue;
      files.push(...walk(full));
    } else {
      if (/\.(ts|tsx|js|jsx|css|scss|html|json)$/i.test(e.name)) files.push(full);
    }
  }
  return files;
}

function replaceInFile(file, paletteFlat) {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content;
  // patterns: rgb(a), hsl(a), named colors, hex (already handled)
  const pattern = /rgba?\([^)]*\)|hsla?\([^)]*\)|\b(white|black|transparent|red|blue|gray|grey)\b/ig;
  updated = updated.replace(pattern, (match) => {
    const parsed = parseColorString(match);
    if (!parsed) return match;
    if (parsed.type === 'transparent') return 'transparent';
    if (parsed.type === 'hex') {
      // map hex to nearest palette
      const rgb = hexToRgb(parsed.hex);
      let best = null;
      let bestD = Infinity;
      for (const p of paletteFlat) {
        const d = rgbDistance(rgb, p.rgb);
        if (d < bestD) { bestD = d; best = p; }
      }
      if (!best) return match;
      return `var(--ds-${best.group}-${best.shade})`;
    }
    if (parsed.type === 'rgb') {
      const rgb = parsed.rgb;
      const alpha = parsed.alpha !== undefined ? parsed.alpha : 1;
      let best = null;
      let bestD = Infinity;
      for (const p of paletteFlat) {
        const d = rgbDistance(rgb, p.rgb);
        if (d < bestD) { bestD = d; best = p; }
      }
      if (!best) return match;
      if (alpha >= 0.999) return `var(--ds-${best.group}-${best.shade})`;
      return `rgba(var(--ds-${best.group}-${best.shade}-rgb), ${alpha})`;
    }
    return match;
  });

  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    return true;
  }
  return false;
}

function run() {
  if (!fs.existsSync(colorsFile)) {
    console.error('colors file not found at', colorsFile);
    process.exit(1);
  }
  const colorsContent = fs.readFileSync(colorsFile, 'utf8');
  const groups = parsePalette(colorsContent);
  const flat = buildFlatPalette(groups);

  const files = walk(path.join(root, 'src')).concat(walk(path.join(root, 'public')));
  let updatedCount = 0;
  for (const f of files) {
    if (path.resolve(f) === path.resolve(colorsFile)) continue;
    try {
      if (replaceInFile(f, flat)) {
        console.log('Updated:', f);
        updatedCount++;
      }
    } catch (err) {
      // ignore
    }
  }
  console.log(`Applied normalized replacements in ${updatedCount} files.`);
}

run();
