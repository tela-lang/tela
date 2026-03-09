
const assert = require('assert');
const { Compiler } = require('../compiler');
const { TelaRuntime } = require('../runtime');
const { JSDOM } = require('jsdom');

// Setup JSDOM
const dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`);
global.window = dom.window;
global.document = dom.window.document;

// Initialize Runtime
const Tela = new TelaRuntime();
global.Tela = Tela;

console.log("Running SFC Syntax Test");

const source = `
component UserCard {
  state name: String = "John Doe"
  state age: Number = 30
  
  prop title: String
  
  function birthday() {
    age = age + 1
  }

  view {
    div {
      class: "card"
      style {
        padding: 20px
        border: "1px solid #ccc"
      }
      
      h2 {
        content: "\${title}"
      }
      
      p {
        content: "Name: \${name}"
        style { font-weight: "bold" }
      }
      
      p {
        content: "Age: \${age}"
      }
      
      button {
        content: "Celebrate"
        @click: birthday
      }
    }
  }
}

component App {
  view {
    div {
      UserCard {
        title: "User Profile"
      }
    }
  }
}
`;

try {
  const compiler = new Compiler();
  const { js, css } = compiler.compile(source);
  
  console.log("--- Compiled JS ---");
  console.log(js);
  console.log("-------------------");
  
  console.log("--- Compiled CSS ---");
  console.log(css);
  console.log("--------------------");

  // Verify CSS extraction
  if (!css.includes('.tela-UserCard-div-')) {
    throw new Error("CSS not extracted correctly for UserCard div");
  }

  // Verify JS compilation
  if (!js.includes('UserCard') || !js.includes('App')) {
    throw new Error("Missing components in compiled output");
  }
  
  // Verify Interpolation
  if (!js.includes('`Name: ${state_UserCard.name}`')) {
    throw new Error("Interpolation for state variable failed");
  }
  
  if (!js.includes('`Age: ${state_UserCard.age}`')) {
    throw new Error("Interpolation for age failed");
  }
  
  if (!js.includes('`${instance.props.title}`')) {
    throw new Error("Interpolation for prop failed");
  }

  // Expose components globally
  const exposedCode = js.replace(/const (\w+) =/g, 'global.$1 =');
  eval(exposedCode);
  
  const container = document.getElementById('app');
  Tela.render(global.App, container);
  
  console.log("Rendered HTML:", container.innerHTML);
  
  // Check Content
  if (!container.innerHTML.includes("User Profile")) {
    throw new Error("Prop 'title' not rendered correctly");
  }
  if (!container.innerHTML.includes("Name: John Doe")) {
    throw new Error("State 'name' not rendered correctly");
  }
  if (!container.innerHTML.includes("Age: 30")) {
    throw new Error("State 'age' not rendered correctly");
  }
  
  // Test Interaction
  const btn = container.querySelector('button');
  if (!btn) throw new Error("Button not found");
  
  btn.click();
  
  console.log("After Click HTML:", container.innerHTML);
  
  if (!container.innerHTML.includes("Age: 31")) {
    throw new Error("State update failed. Expected Age: 31");
  }

  console.log("SFC Test Passed!");
  
} catch (e) {
  console.error("Test Failed:", e);
  process.exit(1);
}
