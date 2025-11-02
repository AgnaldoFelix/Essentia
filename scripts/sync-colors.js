#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const colorsFile = path.join(root, 'design-system', 'colors.ts');

function parseColors(fileContent) {
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
      groups[group][hex] = `var(--ds-${group}-${shade})`;
    }
  }
  return groups;
}

function walk(dir) {
  const files = [];
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

function run() {
  if (!fs.existsSync(colorsFile)) {
    console.error('colors file not found at', colorsFile);
    process.exit(1);
  }

  const colorsContent = fs.readFileSync(colorsFile, 'utf8');
  const mappingGroups = parseColors(colorsContent);
  const flat = {};
  for (const group of Object.keys(mappingGroups)) Object.assign(flat, mappingGroups[group]);
  const targets = Object.keys(flat);
  if (!targets.length) {
    console.log('No hex colors found in design-system/colors.ts');
    return;
  }

  const files = walk(path.join(root, 'src')).concat(walk(path.join(root, 'public'))).concat(walk(root));
  const seen = new Set();
  let updatedFiles = 0;

  for (const file of files) {
    // avoid processing the colors file itself
    if (path.resolve(file) === path.resolve(colorsFile)) continue;
    // only process each file once
    if (seen.has(file)) continue;
    seen.add(file);
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (err) {
      continue;
    }
    let updated = content;
    for (const hex of targets) {
      const regex = new RegExp(hex.replace('#', '#'), 'ig');
      updated = updated.replace(regex, flat[hex]);
    }
    if (updated !== content) {
      fs.writeFileSync(file, updated, 'utf8');
      updatedFiles++;
      console.log('Updated:', file);
    }
  }

  console.log(`Applied replacements in ${updatedFiles} files.`);
}

run();
