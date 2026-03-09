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

console.log('Running Lifecycle Hook Tests');

function compile(src) {
  return new Compiler().compile(src).js;
}

function evalComponent(js) {
  const code = js.replace(/const (\w+) =/g, 'global.$1 =');
  eval(code);
}

// 1. onMount appears in compiled output
try {
  const js = compile(`
    component MountTest {
      state ready: Boolean = false
      onMount {
        ready = true
      }
      view {
        div { content: "test" }
      }
    }
  `);
  assert(js.includes('onMount'), `onMount not in output: ${js}`);
  assert(js.includes('state_MountTest.ready = true'), `onMount body not compiled: ${js}`);
  console.log('  ✓ onMount compiled correctly');
} catch (e) {
  console.error('  ✗ onMount compilation:', e.message);
  process.exit(1);
}

// 2. onDestroy appears in compiled output
try {
  const js = compile(`
    component DestroyTest {
      state cleaned: Boolean = false
      onDestroy {
        cleaned = true
      }
      view {
        div { content: "test" }
      }
    }
  `);
  assert(js.includes('onDestroy'), `onDestroy not in output: ${js}`);
  console.log('  ✓ onDestroy compiled correctly');
} catch (e) {
  console.error('  ✗ onDestroy compilation:', e.message);
  process.exit(1);
}

// 3. onUpdate appears in compiled output
try {
  const js = compile(`
    component UpdateTest {
      state count: Number = 0
      onUpdate {
        count = count + 0
      }
      view {
        div { content: "\${count}" }
      }
    }
  `);
  assert(js.includes('onUpdate'), `onUpdate not in output: ${js}`);
  console.log('  ✓ onUpdate compiled correctly');
} catch (e) {
  console.error('  ✗ onUpdate compilation:', e.message);
  process.exit(1);
}

// 4. Component without lifecycle hooks still works (backward compat)
try {
  const js = compile(`
    component PlainComp {
      state x: Number = 5
      view {
        div { content: "\${x}" }
      }
    }
  `);
  const container = document.getElementById('app');
  evalComponent(js);
  Tela.render(global.PlainComp, container);
  assert.strictEqual(container.firstElementChild.innerHTML, '5');
  console.log('  ✓ Component without lifecycle hooks works');
} catch (e) {
  console.error('  ✗ Backward compat:', e.message);
  process.exit(1);
}

console.log('Lifecycle Tests Passed!');
