const { Parser } = require('../parser');
const { Compiler } = require('../compiler');
const { ASTType } = require('../ast-types');
const assert = require('assert');

console.log('Running Import/Export Tests');

// 1. Parse import declaration
try {
  const parser = new Parser(`
    import Button from "./button.tela"
    component App {
      view { div {} }
    }
  `);
  const ast = parser.parse();
  assert.strictEqual(ast.imports.length, 1);
  assert.strictEqual(ast.imports[0].type, ASTType.IMPORT_DECL);
  assert.strictEqual(ast.imports[0].name, 'Button');
  assert.strictEqual(ast.imports[0].path, './button.tela');
  console.log('  ✓ Import declaration parsed correctly');
} catch (e) {
  console.error('  ✗ Import parsing:', e.message);
  process.exit(1);
}

// 2. Parse export component
try {
  const parser = new Parser(`
    export component Button {
      view { div {} }
    }
  `);
  const ast = parser.parse();
  assert.strictEqual(ast.components.length, 1);
  assert.strictEqual(ast.components[0].exported, true);
  assert.strictEqual(ast.components[0].name, 'Button');
  console.log('  ✓ Export component parsed with exported=true');
} catch (e) {
  console.error('  ✗ Export parsing:', e.message);
  process.exit(1);
}

// 3. Compiler generates import statement
try {
  const compiler = new Compiler();
  const { js } = compiler.compile(`
    import Button from "./button.tela"
    component App {
      view { div {} }
    }
  `);
  assert(js.includes("import { Button } from './button.js'"), `Import not generated: ${js}`);
  console.log('  ✓ Compiler generates ES import statement');
} catch (e) {
  console.error('  ✗ Import codegen:', e.message);
  process.exit(1);
}

// 4. Compiler generates export for exported component
try {
  const compiler = new Compiler();
  const { js } = compiler.compile(`
    export component Button {
      view { div {} }
    }
  `);
  assert(js.includes('export const Button'), `export const not found in: ${js}`);
  console.log('  ✓ Compiler wraps exported component with export const');
} catch (e) {
  console.error('  ✗ Export codegen:', e.message);
  process.exit(1);
}

// 5. Non-exported component does not get export keyword
try {
  const compiler = new Compiler();
  const { js } = compiler.compile(`
    component Internal {
      view { div {} }
    }
  `);
  assert(!js.includes('export const Internal'), `Unexpected export in: ${js}`);
  assert(js.includes('const Internal'), `const not found in: ${js}`);
  console.log('  ✓ Non-exported component stays as const (no export)');
} catch (e) {
  console.error('  ✗ Non-export check:', e.message);
  process.exit(1);
}

// 6. Multiple components — only exported one gets export keyword
try {
  const compiler = new Compiler();
  const { js } = compiler.compile(`
    export component PublicBtn {
      view { div {} }
    }
    component PrivateHelper {
      view { div {} }
    }
  `);
  assert(js.includes('export const PublicBtn'), `Public export missing: ${js}`);
  assert(!js.includes('export const PrivateHelper'), `PrivateHelper should not be exported: ${js}`);
  console.log('  ✓ Mixed export/non-export in same file');
} catch (e) {
  console.error('  ✗ Mixed export:', e.message);
  process.exit(1);
}

console.log('Import/Export Tests Passed!');
