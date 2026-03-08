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

console.log('Running Parent-Child Communication Tests');

function compile(src) {
  return new Compiler().compile(src).js;
}

function evalComponents(js) {
  const code = js.replace(/const (\w+) =/g, 'global.$1 =');
  eval(code);
}

// 1. emit statement parses correctly
try {
  const parser = new Parser(`
    component Child {
      state count: Number = 0
      function inc() {
        count = count + 1
        emit countChange(count)
      }
      view {
        button {
          @click: inc
          content: "+"
        }
      }
    }
  `);
  const ast = parser.parse();
  const fn = ast.components[0].functions[0];
  const emitStmt = fn.body[1];
  assert.strictEqual(emitStmt.type, ASTType.EMIT_STMT);
  assert.strictEqual(emitStmt.eventName, 'countChange');
  assert.strictEqual(emitStmt.args.length, 1);
  console.log('  ✓ emit statement parsed (eventName, args)');
} catch (e) {
  console.error('  ✗ emit parsing:', e.message);
  process.exit(1);
}

// 2. emit compiles to optional-chained prop call
try {
  const js = compile(`
    component EmitCompile {
      state val: Number = 0
      function send() {
        emit valueChange(val)
      }
      view { div { content: "test" } }
    }
  `);
  assert(js.includes('instance.props.onValueChange?.('), `emit not compiled correctly:\n${js}`);
  console.log('  ✓ emit compiles to instance.props.onValueChange?.()');
} catch (e) {
  console.error('  ✗ emit compilation:', e.message);
  process.exit(1);
}

// 3. @customEvent on component element becomes onCustomEvent prop (capitalized)
try {
  const js = compile(`
    component Parent {
      function handleChange() { }
      view {
        div {
          Child {
            @countChange: handleChange
          }
        }
      }
    }
    component Child {
      view { div {} }
    }
  `);
  assert(js.includes("'onCountChange': handleChange"), `component event prop missing:\n${js}`);
  console.log('  ✓ @countChange on component → onCountChange prop');
} catch (e) {
  console.error('  ✗ Component event prop:', e.message);
  process.exit(1);
}

// 4. @click on plain DOM element stays as onclick (DOM event)
try {
  const js = compile(`
    component DomEvents {
      function handle() { }
      view {
        button {
          @click: handle
          content: "go"
        }
      }
    }
  `);
  assert(js.includes("'onclick': handle"), `DOM onclick missing:\n${js}`);
  console.log('  ✓ @click on DOM element compiles to onclick');
} catch (e) {
  console.error('  ✗ DOM event regression:', e.message);
  process.exit(1);
}

// 5. @click on an uppercase component also stays as onclick (DOM event, not custom)
try {
  const js = compile(`
    component Wrapper {
      function handle() { }
      view {
        Button {
          @click: handle
          content: "go"
        }
      }
    }
    component Button {
      view { button { content: "btn" } }
    }
  `);
  assert(js.includes("'onclick': handle"), `@click on component should stay onclick:\n${js}`);
  console.log('  ✓ @click on uppercase component stays as onclick (standard DOM event)');
} catch (e) {
  console.error('  ✗ @click on component:', e.message);
  process.exit(1);
}

// 6. Full runtime: child emits, parent state updates
try {
  const container = document.getElementById('app');
  const js = compile(`
    component ChildCounter {
      state count: Number = 0
      function inc() {
        count = count + 1
        emit countChange(count)
      }
      view {
        button {
          @click: inc
          content: "\${count}"
        }
      }
    }

    component ParentApp {
      state total: Number = 0
      function onChildCount(val) {
        total = val
      }
      view {
        div {
          ChildCounter {
            @countChange: onChildCount
          }
          p { content: "Total: \${total}" }
        }
      }
    }
  `);
  evalComponents(js);
  Tela.render(global.ParentApp, container);

  const p = container.querySelector('p');
  assert.strictEqual(p.innerHTML, 'Total: 0', `Initial total wrong: ${p.innerHTML}`);

  const btn = container.querySelector('button');
  btn.click();

  const p2 = container.querySelector('p');
  assert.strictEqual(p2.innerHTML, 'Total: 1', `After click total wrong: ${p2.innerHTML}`);

  btn.click();
  const p3 = container.querySelector('p');
  assert.strictEqual(p3.innerHTML, 'Total: 2', `After 2nd click: ${p3.innerHTML}`);

  console.log('  ✓ Runtime: child emit updates parent state (0 → 1 → 2)');
} catch (e) {
  console.error('  ✗ Runtime emit flow:', e.message);
  process.exit(1);
}

// 7. Function prop pattern (pass callback as prop directly)
try {
  const container = document.getElementById('app');
  const js = compile(`
    component FnPropChild {
      prop onAction: Function = null
      function doAction() {
        onAction()
      }
      view {
        button {
          @click: doAction
          content: "Go"
        }
      }
    }

    component FnPropParent {
      state fired: Boolean = false
      function handleAction() {
        fired = true
      }
      view {
        div {
          FnPropChild {
            onAction: handleAction
          }
          p { content: "\${fired}" }
        }
      }
    }
  `);
  evalComponents(js);
  Tela.render(global.FnPropParent, container);

  const p = container.querySelector('p');
  assert.strictEqual(p.innerHTML, 'false');
  container.querySelector('button').click();
  const p2 = container.querySelector('p');
  assert.strictEqual(p2.innerHTML, 'true', `fired should be true: ${p2.innerHTML}`);
  console.log('  ✓ Function prop pattern works (pass callback as prop)');
} catch (e) {
  console.error('  ✗ Function prop pattern:', e.message);
  process.exit(1);
}

// 8. emit with no handler is safe (optional chaining)
try {
  const container = document.getElementById('app');
  const js = compile(`
    component SafeEmit {
      state x: Number = 0
      function act() {
        x = x + 1
        emit noHandler(x)
      }
      view {
        button {
          @click: act
          content: "\${x}"
        }
      }
    }
  `);
  evalComponents(js);
  Tela.render(global.SafeEmit, container);
  container.querySelector('button').click();
  assert.strictEqual(container.querySelector('button').innerHTML, '1');
  console.log('  ✓ emit with no listener is safe (does not throw)');
} catch (e) {
  console.error('  ✗ Safe emit:', e.message);
  process.exit(1);
}

console.log('Parent-Child Communication Tests Passed!');
