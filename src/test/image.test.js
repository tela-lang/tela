const { Compiler } = require('../compiler');
const { TelaRuntime } = require('../runtime');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`);
global.window = dom.window;
global.document = dom.window.document;

const Tela = new TelaRuntime();
global.Tela = Tela;

const source = `
component ImageTest {
  view {
    div {
      img { src: "https://example.com/logo.png" alt: "Logo" }
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
  Tela.render(global.ImageTest, container);

  const img = container.querySelector('img');
  if (!img) throw new Error("FAILED: Image not rendered");
  if (img.getAttribute('src') !== 'https://example.com/logo.png') {
    throw new Error("FAILED: Image src incorrect");
  }
  if (img.getAttribute('alt') !== 'Logo') {
    throw new Error("FAILED: Image alt incorrect");
  }

  console.log("Image Test Passed!");
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
