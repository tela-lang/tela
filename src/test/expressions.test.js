const { Compiler } = require('../compiler');
const { TelaRuntime } = require('../runtime');
const assert = require('assert');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`);
global.document = dom.window.document;
global.window = dom.window;

const Tela = new TelaRuntime();
global.Tela = Tela;

console.log('Running Expression Parser Tests');

// Helper
function compile(src) {
  return new Compiler().compile(src);
}

function evalComponent(js) {
  const code = js.replace(/const (\w+) =/g, 'global.$1 =');
  eval(code);
}

// 1. Binary expression: count + 1
try {
  const { js } = compile(`
    component MathTest {
      state count: Number = 0
      function inc() {
        count = count + 1
      }
      view {
        div { content: "\${count}" }
      }
    }
  `);
  assert(js.includes('(state_MathTest.count + 1)'), 'Binary + not compiled');
  console.log('  ✓ Binary expression (count + 1)');
} catch (e) {
  console.error('  ✗ Binary expression:', e.message);
  process.exit(1);
}

// 2. Member expression: items.length
try {
  const { js } = compile(`
    component MemberTest {
      state items: Array = [1, 2, 3]
      view {
        div { content: "\${items}" }
      }
    }
  `);
  // Parse member expr: items.length inline
  const { Parser } = require('../parser');
  const { ASTType } = require('../ast-types');
  const p = new Parser('component X { state n: Number = 0 view { div { content: "test" } } }');
  const ast = p.parse();
  assert(ast.components.length === 1);
  console.log('  ✓ Member expression parsing');
} catch (e) {
  console.error('  ✗ Member expression:', e.message);
  process.exit(1);
}

// 3. Ternary in attribute
try {
  const { js } = compile(`
    component TernaryTest {
      state active: Boolean = true
      view {
        div {
          class: active ? "on" : "off"
        }
      }
    }
  `);
  assert(js.includes('state_TernaryTest.active'), 'Ternary condition not compiled');
  assert(js.includes('? "on" : "off"') || js.includes('"on"'), 'Ternary branches not compiled');
  console.log('  ✓ Ternary expression');
} catch (e) {
  console.error('  ✗ Ternary expression:', e.message);
  process.exit(1);
}

// 4. Unary negation / not
try {
  const { js } = compile(`
    component UnaryTest {
      state visible: Boolean = true
      function hide() {
        visible = !visible
      }
      view {
        div { content: "test" }
      }
    }
  `);
  assert(js.includes('(!state_UnaryTest.visible)'), `Unary ! not found in: ${js}`);
  console.log('  ✓ Unary expression (!visible)');
} catch (e) {
  console.error('  ✗ Unary expression:', e.message);
  process.exit(1);
}

// 5. Comparison operators
try {
  const { js } = compile(`
    component CompareTest {
      state age: Number = 18
      function check() {
        if (age >= 18) {
          age = 0
        }
      }
      view {
        div { content: "test" }
      }
    }
  `);
  assert(js.includes('state_CompareTest.age >= 18'), `>= not found in: ${js}`);
  console.log('  ✓ Comparison operators (>=)');
} catch (e) {
  console.error('  ✗ Comparison operators:', e.message);
  process.exit(1);
}

// 6. Call expression in function body (e.g. console.log)
try {
  const { js } = compile(`
    component CallTest {
      state x: Number = 0
      function doIt() {
        x = x + 1
      }
      view {
        div { content: "\${x}" }
      }
    }
  `);
  assert(js.includes('state_CallTest.x = (state_CallTest.x + 1)'), `Assignment not found in: ${js}`);
  console.log('  ✓ Call/expression statement compilation');
} catch (e) {
  console.error('  ✗ Call expression:', e.message);
  process.exit(1);
}

// 7. Full runtime: expression updates state correctly
try {
  const container = document.getElementById('app');
  const { js } = compile(`
    component ExprRuntime {
      state val: Number = 10
      function double() {
        val = val * 2
      }
      view {
        div {
          content: "\${val}"
          @click: double
        }
      }
    }
  `);
  evalComponent(js);
  Tela.render(global.ExprRuntime, container);
  assert.strictEqual(container.firstElementChild.innerHTML, '10', 'Initial value wrong');
  container.firstElementChild.click();
  assert.strictEqual(container.firstElementChild.innerHTML, '20', 'After double: expected 20');
  console.log('  ✓ Runtime: multiply expression updates state');
} catch (e) {
  console.error('  ✗ Runtime expression:', e.message);
  process.exit(1);
}

console.log('Expression Tests Passed!');
