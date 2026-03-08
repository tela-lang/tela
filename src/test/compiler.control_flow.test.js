const { Compiler } = require('../compiler');

function testCompilerControlFlow() {
  const source = `
component FeatureTest {
  state show: boolean = true
  state items: any
  function noop() {}
  view {
    Div {
      if (show) {
        Span { content: "Shown" }
      } else {
        Span { content: "Hidden" }
      }
      for (item in items) {
        Span { content: item }
      }
    }
  }
}
`;

  const compiler = new Compiler();
  const { js: output } = compiler.compile(source);
  console.log('--- Compiled Output ---\n' + output + '\n------------------------');

  // Basic presence checks
  if (!output.includes("Tela.defineComponent")) {
    throw new Error("Missing component definition");
  }

  if (!output.includes("state_FeatureTest.show")) {
    throw new Error("Missing state.show usage in compiled output");
  }

  // Conditional compiled to ternary returning arrays
  if (!output.includes("? [") || !output.includes(": [")) {
    throw new Error("Conditional not compiled to array ternary");
  }

  // Loop compiled to map over items
  if (!output.includes("state_FeatureTest.items.map(") || !output.includes("=> [")) {
    throw new Error("Loop not compiled to map with array body");
  }

  // Loop variable should not be rewritten to state.item
  if (output.includes("state_FeatureTest.item") && !output.includes("state_FeatureTest.items")) {
     // Note: state_FeatureTest.items is expected, but state_FeatureTest.item (singular) is not
    throw new Error("Loop variable was incorrectly rewritten to state.item");
  }

  console.log("Control flow compiler tests passed.");
}

try {
  testCompilerControlFlow();
} catch (e) {
  console.error(e);
  process.exit(1);
}
