const { Compiler } = require('../compiler');
const { Parser } = require('../parser');
const { ASTType } = require('../ast-types');
const { TelaRuntime } = require('../runtime');
const assert = require('assert');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`);
global.document = dom.window.document;
global.window = dom.window;

const Tela = new TelaRuntime();
global.Tela = Tela;

console.log('Running Async Function Tests');

function compile(src) {
  return new Compiler().compile(src).js;
}

// 1. async function parses correctly
try {
  const parser = new Parser(`
    component AsyncComp {
      state data: String = ""
      async function fetchData() {
        data = await fetch("/api/data")
      }
      view { div { content: "\${data}" } }
    }
  `);
  const ast = parser.parse();
  const fn = ast.components[0].functions[0];
  assert.strictEqual(fn.async, true, 'Function should be marked async');
  assert.strictEqual(fn.name, 'fetchData');
  assert.strictEqual(fn.body[0].value.type, ASTType.AWAIT_EXPR, 'Should contain AWAIT_EXPR');
  console.log('  ✓ async function parsed with async=true and AWAIT_EXPR');
} catch (e) {
  console.error('  ✗ Parsing async function:', e.message);
  process.exit(1);
}

// 2. async function compiles to async arrow function
try {
  const js = compile(`
    component AsyncCompile {
      state result: String = ""
      async function load() {
        result = await fetch("/api")
      }
      view { div { content: "\${result}" } }
    }
  `);
  assert(js.includes('const load = async () =>'), `async arrow fn not found in:\n${js}`);
  assert(js.includes('await fetch'), `await not emitted in:\n${js}`);
  console.log('  ✓ async function compiles to async arrow function');
} catch (e) {
  console.error('  ✗ Compiling async function:', e.message);
  process.exit(1);
}

// 3. Local variables in async function get `let`, state vars get `state_X.`
try {
  const js = compile(`
    component LocalVars {
      state users: Array = []
      state loading: Boolean = true
      async function fetchUsers() {
        loading = true
        response = await fetch("/api/users")
        data = await response.json()
        users = data
        loading = false
      }
      view { div { content: "test" } }
    }
  `);
  assert(js.includes('state_LocalVars.loading = true'), `state assignment missing:\n${js}`);
  assert(js.includes('let response = await'), `let response missing:\n${js}`);
  assert(js.includes('let data = await'), `let data missing:\n${js}`);
  assert(js.includes('state_LocalVars.users = data'), `state users assignment missing:\n${js}`);
  assert(js.includes('state_LocalVars.loading = false'), `state loading=false missing:\n${js}`);
  console.log('  ✓ Local vars get `let`, state vars get state_Comp. prefix');
} catch (e) {
  console.error('  ✗ Local variable handling:', e.message);
  process.exit(1);
}

// 4. Chained await: await response.json()
try {
  const js = compile(`
    component ChainedAwait {
      state items: Array = []
      async function load() {
        res = await fetch("/api")
        items = await res.json()
      }
      view { div { content: "test" } }
    }
  `);
  assert(js.includes('await res.json()'), `chained await missing:\n${js}`);
  console.log('  ✓ Chained await (await res.json()) compiles correctly');
} catch (e) {
  console.error('  ✗ Chained await:', e.message);
  process.exit(1);
}

// 5. Regular (non-async) functions still work unchanged
try {
  const js = compile(`
    component SyncStillWorks {
      state count: Number = 0
      function inc() {
        count = count + 1
      }
      view { div { content: "\${count}" @click: inc } }
    }
  `);
  assert(js.includes('const inc = () =>'), `sync fn should not be async:\n${js}`);
  assert(!js.includes('const inc = async'), `sync fn should not have async:\n${js}`);
  console.log('  ✓ Regular sync functions unchanged');
} catch (e) {
  console.error('  ✗ Sync functions regression:', e.message);
  process.exit(1);
}

// 6. Full runtime: async function updates state after await resolves
try {
  // Mock fetch globally
  global.fetch = async (url) => ({
    json: async () => ['Alice', 'Bob', 'Carol']
  });

  const js = compile(`
    component AsyncRuntime {
      state names: Array = []
      state loaded: Boolean = false
      async function loadNames() {
        res = await fetch("/api/names")
        names = await res.json()
        loaded = true
      }
      view {
        div { content: "\${loaded}" }
      }
    }
  `);

  const code = js.replace(/const (\w+) =/g, 'global.$1 =');
  eval(code);

  const container = document.getElementById('app');
  Tela.render(global.AsyncRuntime, container);

  assert.strictEqual(container.firstElementChild.innerHTML, 'false', 'Initial: loaded should be false');

  // Call the async function and wait
  const result = global.loadNames();
  assert(result instanceof Promise, 'loadNames should return a Promise');

  result.then(() => {
    assert.strictEqual(container.firstElementChild.innerHTML, 'true', 'After await: loaded should be true');
    console.log('  ✓ Async function updates state after await resolves');
    console.log('Async Tests Passed!');
  }).catch(e => {
    console.error('  ✗ Async runtime test:', e.message);
    process.exit(1);
  });
} catch (e) {
  console.error('  ✗ Async runtime setup:', e.message);
  process.exit(1);
}
