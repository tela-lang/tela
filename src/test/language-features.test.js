'use strict';

const assert = require('node:assert');
const { test } = require('node:test');
const { Compiler } = require('../compiler');
const { Parser } = require('../parser');

// ─── Helpers ────────────────────────────────────────────────────────────────

function compile(source) {
  const compiler = new Compiler();
  return compiler.compile(source);
}

function parse(source) {
  const parser = new Parser(source);
  return parser.parse();
}

function compileOk(source) {
  const { js } = compile(source);
  return js;
}

// ─── try / catch / finally ───────────────────────────────────────────────────

test('try/catch compiles correctly', () => {
  const source = `
    component TryCatch {
      function load() {
        try {
          result = fetch("url")
        } catch (e) {
          error = e
        }
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('try {'), 'should include try block');
  assert.ok(js.includes('catch (e)'), 'should include catch with param');
});

test('try/catch/finally compiles all three blocks', () => {
  const source = `
    component TryCatchFinally {
      function load() {
        try {
          result = "ok"
        } catch (err) {
          error = err
        } finally {
          loading = false
        }
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('try {'), 'should include try');
  assert.ok(js.includes('catch (err)'), 'should include catch');
  assert.ok(js.includes('finally {'), 'should include finally');
});

test('throw compiles correctly', () => {
  const source = `
    component ThrowTest {
      function guard() {
        throw "Not allowed"
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('throw "Not allowed"'), 'should include throw statement');
});

// ─── switch / case / default (function body) ────────────────────────────────

test('switch/case compiles in function body', () => {
  const source = `
    component SwitchTest {
      state status: String = "ok"
      function handle() {
        switch (status) {
          case "ok": result = 1
          case "err": result = 2
          default: result = 0
        }
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('switch ('), 'should include switch');
  assert.ok(js.includes('case "ok":'), 'should include case ok');
  assert.ok(js.includes('case "err":'), 'should include case err');
  assert.ok(js.includes('default:'), 'should include default');
  assert.ok(js.includes('break;'), 'should auto-insert break');
});

// ─── switch / case / default (view block) ───────────────────────────────────

test('view-level switch compiles to IIFE ternary chain', () => {
  const source = `
    component ViewSwitch {
      state tab: String = "home"
      view {
        div {
          switch (tab) {
            case "home":
              span { content: "Home" }
            case "about":
              span { content: "About" }
            default:
              span { content: "Unknown" }
          }
        }
      }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('((_d) =>'), 'should include IIFE with _d');
  assert.ok(js.includes('_d ==='), 'should compare against hoisted discriminant');
  assert.ok(js.includes('"home"'), 'should include home case test');
  assert.ok(js.includes('"about"'), 'should include about case test');
});

// ─── enum ────────────────────────────────────────────────────────────────────

test('enum compiles to Object.freeze', () => {
  const source = `
    enum Status { ACTIVE INACTIVE PENDING }
    component EnumTest {
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('Object.freeze'), 'should use Object.freeze');
  assert.ok(js.includes("ACTIVE: 'ACTIVE'"), 'should include ACTIVE entry');
  assert.ok(js.includes("INACTIVE: 'INACTIVE'"), 'should include INACTIVE entry');
  assert.ok(js.includes("PENDING: 'PENDING'"), 'should include PENDING entry');
});

test('exported enum has export keyword', () => {
  const source = `
    export enum Role { ADMIN USER GUEST }
    component RoleTest {
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('export const Role'), 'should export the enum');
});

// ─── model ───────────────────────────────────────────────────────────────────

test('model compiles to factory function', () => {
  const source = `
    model User { name: String age: Number email: String }
    component ModelTest {
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('const User = (data) =>'), 'should create factory function');
  assert.ok(js.includes('name: data.name'), 'should map name field');
  assert.ok(js.includes('age: data.age'), 'should map age field');
  assert.ok(js.includes('email: data.email'), 'should map email field');
});

test('exported model has export keyword', () => {
  const source = `
    export model Product { id: Number title: String price: Number }
    component ProductTest {
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('export const Product'), 'should export the model');
});

// ─── ?. optional chaining ────────────────────────────────────────────────────

test('optional chain ?. compiles correctly', () => {
  const source = `
    component OptChain {
      state user: Object = null
      function getName() {
        name = user?.name
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('?.name'), 'should include optional chain access');
});

test('optional chain parses as OPTIONAL_CHAIN node', () => {
  const source = `
    component OptChainParse {
      function run() {
        x = obj?.prop
      }
      view { div {} }
    }
  `;
  const ast = parse(source);
  const fn = ast.components[0].functions[0];
  const assignment = fn.body[0];
  assert.strictEqual(assignment.value.type, 'OptionalChain', 'value should be OptionalChain node');
  assert.strictEqual(assignment.value.property, 'prop', 'property name should be prop');
});

// ─── ?? null coalescing ──────────────────────────────────────────────────────

test('null coalescing ?? compiles correctly', () => {
  const source = `
    component NullCoalesce {
      state label: String = null
      function getLabel() {
        result = label ?? "default"
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('??'), 'should include ?? operator');
  assert.ok(js.includes('"default"'), 'should include fallback value');
});

// ─── while loop ──────────────────────────────────────────────────────────────

test('while loop compiles correctly', () => {
  const source = `
    component WhileTest {
      function loop() {
        i = 0
        while (i < 10) {
          i = i + 1
        }
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('while ('), 'should include while');
  assert.ok(js.includes('< 10)'), 'should include condition');
});

test('break and continue compile correctly', () => {
  const source = `
    component BreakContinue {
      function loop() {
        i = 0
        while (i < 100) {
          if (i == 5) {
            break
          }
          if (i == 3) {
            continue
          }
          i = i + 1
        }
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('break;'), 'should include break');
  assert.ok(js.includes('continue;'), 'should include continue');
});

// ─── for-in loop (function body) ─────────────────────────────────────────────

test('for-in loop compiles to for...of', () => {
  const source = `
    component ForInTest {
      state items: Array = null
      function process() {
        for (item in items) {
          log = item
        }
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('for (const item of'), 'should compile to for...of');
  assert.ok(js.includes('state_ForInTest.items'), 'should resolve state var');
});

// ─── C-style for loop ────────────────────────────────────────────────────────

test('C-style for loop compiles correctly', () => {
  const source = `
    component ForClassicTest {
      function count() {
        for (i = 0; i < 5; i = i + 1) {
          total = total + i
        }
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('for (let i = 0; (i < 5); i ='), 'should compile C-style for');
});

// ─── bare return (no value) ──────────────────────────────────────────────────

test('bare return compiles to return null', () => {
  const source = `
    component BareReturn {
      function guard() {
        if (true) {
          return
        }
        doSomething()
      }
      view { div {} }
    }
  `;
  const js = compileOk(source);
  assert.ok(js.includes('return null;'), 'bare return should compile to return null');
});

console.log('Language Feature Tests Passed!');
