#!/usr/bin/env node
/**
 * Builds dist/runtime.umd.js from src/runtime.js.
 * Strips the Node.js module.exports line and wraps in a UMD bundle.
 */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '../src/runtime.js'), 'utf8');

// Remove the Node-only module.exports line
const core = src.replace(/^module\.exports\s*=.*$/m, '').trim();

const umd = `/*!
 * Tela Runtime v${require('../package.json').version}
 * https://github.com/tela-lang/tela
 * MIT License
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Tela = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
${core}

  if (typeof window === 'undefined') {
    return new TelaRuntime();
  }
  // Browser: expose singleton
  return new TelaRuntime();
}));
`;

const outPath = path.join(__dirname, '../dist/runtime.umd.js');
fs.writeFileSync(outPath, umd);
console.log(`Built dist/runtime.umd.js (${(umd.length / 1024).toFixed(1)} KB)`);
