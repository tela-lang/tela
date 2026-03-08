const { Compiler } = require('../compiler');
const { TelaRuntime } = require('../runtime');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`);
global.window = dom.window;
global.document = dom.window.document;

const Tela = new TelaRuntime();
global.Tela = Tela;

const source = `
component BindExample {
  state name: String = "Alice"
  view {
    div {
      input { bind value: name }
      p { content: "Hello, \${name}" }
    }
  }
}
`;

try {
  const compiler = new Compiler();
  const { js } = compiler.compile(source);
  const exposed = js.replace(/const (\w+) =/g, 'global.$1 =');
  eval(exposed);

  const container = document.getElementById('app');
  Tela.render(global.BindExample, container);

  const input = container.querySelector('input');
  const p = container.querySelector('p');
  if (!input || !p) throw new Error("FAILED: Missing input or paragraph");
  if (!p.textContent.includes('Alice')) throw new Error("FAILED: Initial content mismatch");

  input.value = 'Bob';
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

  const newP = container.querySelector('p');
  if (!newP.textContent.includes('Bob')) throw new Error("FAILED: Bind did not update content");

  console.log("Bind Test Passed!");
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
