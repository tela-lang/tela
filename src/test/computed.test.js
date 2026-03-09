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

console.log('Running Computed Property Tests');

function compile(src) {
  return new Compiler().compile(src).js;
}

function evalComponent(js) {
  const code = js.replace(/const (\w+) =/g, 'global.$1 =');
  eval(code);
}

// 1. Computed property appears in compiled output with getter
try {
  const js = compile(`
    component ComputedTest {
      state price: Number = 10
      state qty: Number = 3
      computed total = price * qty
      view {
        div { content: "\${total}" }
      }
    }
  `);
  assert(js.includes('get total()'), `getter not found in: ${js}`);
  assert(js.includes('state_ComputedTest.price'), `state ref not found: ${js}`);
  console.log('  ✓ Computed property compiled to getter');
} catch (e) {
  console.error('  ✗ Computed compilation:', e.message);
  process.exit(1);
}

// 2. Computed renders correctly at runtime
try {
  const container = document.getElementById('app');
  const js = compile(`
    component ComputedRuntime {
      state price: Number = 5
      state qty: Number = 4
      computed total = price * qty
      view {
        div { content: "\${total}" }
      }
    }
  `);
  evalComponent(js);
  Tela.render(global.ComputedRuntime, container);
  assert.strictEqual(container.firstElementChild.innerHTML, '20', `Expected 20, got: ${container.firstElementChild.innerHTML}`);
  console.log('  ✓ Computed property renders correct value (5 * 4 = 20)');
} catch (e) {
  console.error('  ✗ Computed runtime:', e.message);
  process.exit(1);
}

// 3. Watcher appears in compiled output
try {
  const js = compile(`
    component WatchTest {
      state count: Number = 0
      watch count {
        count = count + 0
      }
      view {
        div { content: "\${count}" }
      }
    }
  `);
  assert(js.includes('count:'), `watcher key not found in: ${js}`);
  console.log('  ✓ Watcher compiled correctly');
} catch (e) {
  console.error('  ✗ Watcher compilation:', e.message);
  process.exit(1);
}

// 4. Multiple computed properties
try {
  const js = compile(`
    component MultiComputed {
      state a: Number = 2
      state b: Number = 3
      computed sum = a + b
      computed product = a * b
      view {
        div { content: "test" }
      }
    }
  `);
  assert(js.includes('get sum()'), `sum getter missing: ${js}`);
  assert(js.includes('get product()'), `product getter missing: ${js}`);
  console.log('  ✓ Multiple computed properties');
} catch (e) {
  console.error('  ✗ Multiple computed:', e.message);
  process.exit(1);
}

console.log('Computed & Watcher Tests Passed!');
