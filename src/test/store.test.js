const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Parser } = require('../parser');
const { Compiler } = require('../compiler');
const { ASTType } = require('../ast-types');

function parse(src) {
  return new Parser(src).parse();
}

function compile(src) {
  return new Compiler().compile(src);
}

function compileOk(src) {
  const { js } = compile(src);
  return js;
}

// ─── Parser ──────────────────────────────────────────────────────────────────

test('store keyword parses to STORE_DECL node', () => {
  const ast = parse(`
    store AppStore {
      count: Number = 0
      user: Object = null
    }
    component X { view { div {} } }
  `);
  assert.strictEqual(ast.stores.length, 1);
  assert.strictEqual(ast.stores[0].type, ASTType.STORE_DECL);
  assert.strictEqual(ast.stores[0].name, 'AppStore');
  assert.strictEqual(ast.stores[0].fields.length, 2);
});

test('store fields have correct name, type, and default value', () => {
  const ast = parse(`
    store S {
      count: Number = 42
      label: String = "hello"
      flag:  Boolean = true
      data:  Object = null
    }
    component X { view { div {} } }
  `);
  const fields = ast.stores[0].fields;
  assert.strictEqual(fields[0].name, 'count');
  assert.strictEqual(fields[0].type, 'Number');
  assert.strictEqual(fields[0].defaultValue.value, 42);

  assert.strictEqual(fields[1].name, 'label');
  assert.strictEqual(fields[1].defaultValue.value, 'hello');

  assert.strictEqual(fields[2].name, 'flag');
  assert.strictEqual(fields[2].defaultValue.value, true);

  assert.strictEqual(fields[3].name, 'data');
  assert.strictEqual(fields[3].defaultValue.value, null);
});

test('store field without default value has null defaultValue', () => {
  const ast = parse(`
    store S { name: String }
    component X { view { div {} } }
  `);
  assert.strictEqual(ast.stores[0].fields[0].defaultValue, null);
});

test('export store sets exported flag', () => {
  const ast = parse(`
    export store AppStore { count: Number = 0 }
    component X { view { div {} } }
  `);
  assert.strictEqual(ast.stores[0].exported, true);
});

// ─── Compiler ────────────────────────────────────────────────────────────────

test('store compiles to Tela.store() call', () => {
  const js = compileOk(`
    store AppStore { count: Number = 0 theme: String = "light" }
    component X { view { div {} } }
  `);
  assert.ok(js.includes("Tela.store('AppStore'"), 'should call Tela.store');
  assert.ok(js.includes('count: 0'), 'should include count field');
  assert.ok(js.includes('theme: "light"'), 'should include theme field');
});

test('export store emits export keyword', () => {
  const js = compileOk(`
    export store AppStore { count: Number = 0 }
    component X { view { div {} } }
  `);
  assert.ok(js.includes("export const AppStore = Tela.store("), 'should export');
});

test('store field with null default compiles to null', () => {
  const js = compileOk(`
    store S { user: Object = null }
    component X { view { div {} } }
  `);
  assert.ok(js.includes('user: null'), 'should compile null default');
});

test('component referencing store in function gets subscribeStore emitted', () => {
  const js = compileOk(`
    store AppStore { count: Number = 0 }
    component Counter {
      function increment() {
        AppStore.count = AppStore.count + 1
      }
      view { div {} }
    }
  `);
  assert.ok(js.includes("Tela.subscribeStore('AppStore'"), 'should subscribe');
});

test('component referencing store gets unsubscribeStore in onDestroy', () => {
  const js = compileOk(`
    store AppStore { count: Number = 0 }
    component Counter {
      function increment() {
        AppStore.count = AppStore.count + 1
      }
      view { div {} }
    }
  `);
  assert.ok(js.includes("Tela.unsubscribeStore('AppStore'"), 'should unsubscribe');
  assert.ok(js.includes('onDestroy'), 'should have onDestroy');
});

test('component NOT referencing store does not get subscribe call', () => {
  const js = compileOk(`
    store AppStore { count: Number = 0 }
    component Plain {
      view { div { content: "hello" } }
    }
  `);
  assert.ok(!js.includes('subscribeStore'), 'should not subscribe');
});

test('store write in function compiles as direct member assignment', () => {
  const js = compileOk(`
    store AppStore { count: Number = 0 }
    component Counter {
      function increment() {
        AppStore.count = AppStore.count + 1
      }
      view { div {} }
    }
  `);
  assert.ok(js.includes('AppStore.count = (AppStore.count + 1)'), 'should write directly to store');
  // Must NOT rewrite to state_Counter.AppStore
  assert.ok(!js.includes('state_Counter.AppStore'), 'should not treat store as component state');
});

test('member assignment for deeply nested path', () => {
  const js = compileOk(`
    store S { a: Object = null }
    component X {
      function go() {
        S.a = null
      }
      view { div {} }
    }
  `);
  assert.ok(js.includes('S.a = null'), 'should compile nested member assignment');
});

// ─── Route Parameters ────────────────────────────────────────────────────────

test('route params variable parsed correctly', () => {
  const ast = parse(`
    component App {
      route path: String
      route params: Object
      view { div {} }
    }
  `);
  const routes = ast.components[0].routes;
  assert.strictEqual(routes.length, 2);
  assert.strictEqual(routes.find(r => r.valueType === 'String').name, 'path');
  assert.strictEqual(routes.find(r => r.valueType === 'Object').name, 'params');
});

test('route patterns extracted from view switch', () => {
  const js = compileOk(`
    component App {
      route path: String
      route params: Object
      view {
        div {
          switch (path) {
            case "/": Home {}
            case "/users": UserList {}
            case "/users/:id": UserDetail {}
            default: NotFound {}
          }
        }
      }
    }
  `);
  assert.ok(js.includes('"/"'), 'should have / pattern');
  assert.ok(js.includes('"/users"'), 'should have /users pattern');
  assert.ok(js.includes('"/users/:id"'), 'should have /users/:id pattern');
  assert.ok(js.includes('Tela.matchRoute'), 'should use matchRoute');
});

test('path state init uses Tela.matchRoute when patterns exist', () => {
  const js = compileOk(`
    component App {
      route path: String
      route params: Object
      view {
        div {
          switch (path) {
            case "/": Home {}
            case "/users/:id": UserDetail {}
            default: NotFound {}
          }
        }
      }
    }
  `);
  assert.ok(js.includes('let path = Tela.matchRoute'), 'path init uses matchRoute as plain let');
  assert.ok(js.includes('let params = Tela.matchRoute'), 'params init uses matchRoute as plain let');
});

test('navigate updates both path and params', () => {
  const js = compileOk(`
    component App {
      route path: String
      route params: Object
      view {
        div {
          switch (path) {
            case "/users/:id": UserDetail {}
            default: Home {}
          }
        }
      }
    }
  `);
  assert.ok(js.includes('_rm.pattern'), 'navigate updates pattern');
  assert.ok(js.includes('_rm.params'), 'navigate updates params');
});

test('single route (no params) still works as before', () => {
  const js = compileOk(`
    component App {
      route path: String
      view { div {} }
    }
  `);
  assert.ok(js.includes('let path = window.location.pathname'), 'no patterns = raw pathname as plain let');
  assert.ok(!js.includes('let params'), 'no params variable emitted');
});

// ─── Runtime: Tela.matchRoute ─────────────────────────────────────────────────

test('Tela.matchRoute matches static pattern', () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const result = rt.matchRoute(['/about', '/users/:id'], '/about');
  assert.strictEqual(result.pattern, '/about');
  assert.deepStrictEqual(result.params, {});
});

test('Tela.matchRoute extracts route params', () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const result = rt.matchRoute(['/users/:id', '/about'], '/users/42');
  assert.strictEqual(result.pattern, '/users/:id');
  assert.deepStrictEqual(result.params, { id: '42' });
});

test('Tela.matchRoute extracts multiple params', () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const result = rt.matchRoute(['/users/:id/posts/:postId'], '/users/5/posts/99');
  assert.strictEqual(result.pattern, '/users/:id/posts/:postId');
  assert.deepStrictEqual(result.params, { id: '5', postId: '99' });
});

test('Tela.matchRoute falls back to raw pathname when no match', () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const result = rt.matchRoute(['/about'], '/unknown');
  assert.strictEqual(result.pattern, '/unknown');
  assert.deepStrictEqual(result.params, {});
});

test('Tela.matchRoute with empty pattern list returns raw pathname', () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const result = rt.matchRoute([], '/any/path');
  assert.strictEqual(result.pattern, '/any/path');
  assert.deepStrictEqual(result.params, {});
});

// ─── Runtime: Tela.store ──────────────────────────────────────────────────────

test('Tela.store returns same proxy for same name', () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const a = rt.store('S', { x: 1 });
  const b = rt.store('S', { x: 99 });
  assert.strictEqual(a, b, 'same proxy returned');
});

const tick = () => new Promise(resolve => setImmediate(resolve));

test('writing to store triggers subscribers', async () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const s = rt.store('Counter', { n: 0 });
  let calls = 0;
  rt.subscribeStore('Counter', () => calls++);
  s.n = 1;
  await tick();
  assert.strictEqual(calls, 1);
  s.n = 2;
  await tick();
  assert.strictEqual(calls, 2);
});

test('writing same value to store is a no-op', async () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const s = rt.store('NoOp', { x: 5 });
  let calls = 0;
  rt.subscribeStore('NoOp', () => calls++);
  s.x = 5; // same value
  await tick();
  assert.strictEqual(calls, 0);
});

test('unsubscribeStore stops receiving updates', async () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const s = rt.store('Unsub', { x: 0 });
  let calls = 0;
  const fn = () => calls++;
  rt.subscribeStore('Unsub', fn);
  s.x = 1;
  await tick();
  assert.strictEqual(calls, 1);
  rt.unsubscribeStore('Unsub', fn);
  s.x = 2;
  await tick();
  assert.strictEqual(calls, 1, 'no more calls after unsubscribe');
});

test('multiple subscribers all notified', async () => {
  const { TelaRuntime } = require('../runtime');
  const rt = new TelaRuntime();
  const s = rt.store('Multi', { v: 0 });
  let a = 0, b = 0;
  rt.subscribeStore('Multi', () => a++);
  rt.subscribeStore('Multi', () => b++);
  s.v = 1;
  await tick();
  assert.strictEqual(a, 1);
  assert.strictEqual(b, 1);
});
