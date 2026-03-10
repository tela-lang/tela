#!/usr/bin/env node

const fs   = require('fs');
const path = require('path');
const { Compiler } = require('../src/compiler');

const VERSION = require('../package.json').version;
const args    = process.argv.slice(2);
const command = args[0];

// ─── helpers ────────────────────────────────────────────────────────────────

function compileFile(absolutePath, useGlobal) {
  const source = fs.readFileSync(absolutePath, 'utf8');
  const compiler = new Compiler();
  let { js, css } = compiler.compile(source);

  if (useGlobal) {
    const names = [];
    const re = /const\s+([A-Za-z_]\w*)\s*=\s*Tela\.defineComponent/g;
    let m;
    while ((m = re.exec(js)) !== null) names.push(m[1]);
    if (names.length > 0) {
      js += `\n(function(){\n  if (typeof window !== 'undefined') {\n` +
            `    ${names.map(n => `window.${n} = ${n};`).join('\n    ')}\n  }\n` +
            `  if (typeof module !== 'undefined' && module.exports) {\n` +
            `    module.exports = { ${names.join(', ')} };\n  }\n})();`;
    }
  }
  return { js, css };
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// ─── commands ────────────────────────────────────────────────────────────────

if (command === 'compile') {
  const inputFile = args[1];
  const useGlobal = args.includes('--global');

  if (!inputFile) { console.error('Error: specify an input file.\n  tela compile <file.tela>'); process.exit(1); }

  const absolutePath = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(absolutePath)) { console.error(`Error: file not found: ${absolutePath}`); process.exit(1); }

  try {
    const { js, css } = compileFile(absolutePath, useGlobal);
    const base = path.basename(inputFile, path.extname(inputFile));
    const dir  = path.dirname(absolutePath);
    fs.writeFileSync(path.join(dir, `${base}.js`),  js);
    fs.writeFileSync(path.join(dir, `${base}.css`), css);
    console.log(`✓ ${base}.js`);
    console.log(`✓ ${base}.css`);
  } catch (e) {
    console.error('Compilation failed:', e.message);
    process.exit(1);
  }

} else if (command === 'compile-all') {
  const dir       = args[1];
  const useGlobal = args.includes('--global');

  if (!dir) { console.error('Error: specify a directory.\n  tela compile-all <dir>'); process.exit(1); }

  const absoluteDir = path.resolve(process.cwd(), dir);
  const files = fs.readdirSync(absoluteDir).filter(f => f.endsWith('.tela'));

  let anyError = false;
  for (const file of files) {
    const absPath = path.join(absoluteDir, file);
    const base    = path.basename(file, '.tela');
    try {
      const { js, css } = compileFile(absPath, useGlobal);
      fs.writeFileSync(path.join(absoluteDir, `${base}.js`),  js);
      fs.writeFileSync(path.join(absoluteDir, `${base}.css`), css);
      console.log(`Generated: ${base}.js`);
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
      anyError = true;
    }
  }
  if (anyError) process.exit(1);

} else if (command === 'init') {
  const projectName = args[1] || 'my-tela-app';
  const dest = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(dest)) {
    console.error(`Error: directory "${projectName}" already exists.`);
    process.exit(1);
  }

  const templateDir = path.join(__dirname, '../templates/init');
  copyDir(templateDir, dest);

  // Rename package.json name field
  const pkgPath = path.join(dest, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = projectName;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  console.log(`\n✓ Created ${projectName}/\n`);
  console.log('  Next steps:\n');
  console.log(`    cd ${projectName}`);
  console.log('    npm install');
  console.log('    npx tela compile-all components/ --global');
  console.log('    open index.html\n');
  console.log('  Or for a backend project (Spring Boot, Express…):');
  console.log('    Place .tela files in your static/components/ directory');
  console.log('    Run: npx tela compile-all static/components/ --global\n');

} else if (command === 'dev') {
  const { startDevServer } = require('../src/dev-server');

  // Parse: tela dev [components-dir] [--root dir] [--port N] [--global]
  const componentsDir = (args[1] && !args[1].startsWith('--')) ? args[1] : 'components';
  const rootIdx  = args.indexOf('--root');
  const portIdx  = args.indexOf('--port');
  const rootDir  = rootIdx !== -1 ? args[rootIdx + 1] : '.';
  const port     = portIdx !== -1 ? parseInt(args[portIdx + 1], 10) : 3000;
  const useGlobal = args.includes('--global');

  startDevServer({ componentsDir, rootDir, port, useGlobal });

} else if (command === '--version' || command === '-v') {
  console.log(`tela v${VERSION}`);

} else {
  console.log(`\n  tela v${VERSION} — A declarative UI language\n`);
  console.log('  Usage:\n');
  console.log('    tela init [project-name]        Scaffold a new Tela project');
  console.log('    tela compile <file.tela>         Compile a single component');
  console.log('    tela compile-all <dir>           Compile all .tela files in a directory');
  console.log('    tela dev [components-dir]        Start dev server with live reload');
  console.log('    tela --version                   Print version\n');
  console.log('  Options:\n');
  console.log('    --global        Expose compiled components on window (for plain HTML use)');
  console.log('    --port <n>      Dev server port (default: 3000)');
  console.log('    --root <dir>    Root directory to serve (default: .)');
  console.log('\n  Examples:\n');
  console.log('    tela init my-app');
  console.log('    tela compile src/App.tela --global');
  console.log('    tela compile-all src/components/ --global');
  console.log('    tela dev components/ --global');
  console.log('    tela dev components/ --port 8080 --root . --global\n');
  console.log('  Runtime CDN:\n');
  console.log('    <script src="https://unpkg.com/@tela-lang/tela@latest/dist/runtime.umd.js"></script>\n');
}
