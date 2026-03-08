const { Compiler } = require('../compiler');

function testScopedCSS() {
  console.log("Running Scoped CSS Test");

  const source = `
component StyledComp {
  state color: String = "red"
  
  view {
    div {
      style {
        background-color: "blue"
        padding: 20px
        color: color
      }
      content: "Styled Content"
    }
  }
}
`;

  const compiler = new Compiler();
  const { js, css } = compiler.compile(source);

  console.log("--- Generated CSS ---");
  console.log(css);
  console.log("---------------------");
  console.log("--- Generated JS ---");
  console.log(js);
  console.log("--------------------");

  // Check CSS
  if (!css.includes("background-color: blue")) {
    throw new Error("Static style 'background-color' missing from CSS");
  }
  if (!css.includes("padding: 20px")) {
    throw new Error("Static style 'padding' missing from CSS");
  }
  if (css.includes("color: color")) {
    throw new Error("Dynamic style 'color' should not be in CSS");
  }
  
  // Extract class name from CSS
  const classMatch = css.match(/\.(tela-StyledComp-div-\d+)/);
  if (!classMatch) {
    throw new Error("Generated class name not found in CSS");
  }
  const className = classMatch[1];
  console.log("Found class name:", className);

  // Check JS
  if (!js.includes(`'class': "${className}"`)) {
    throw new Error(`Class name ${className} missing from JS`);
  }
  
  // Check Dynamic Style in JS
  // It should be in the style object
  // 'style': { 'color': state_StyledComp.color }
  // My compiler might output: 'style': { 'color': state_StyledComp.color }
  // Let's check roughly
  if (!js.includes("'style': { 'color': state_StyledComp.color }")) {
    throw new Error("Dynamic style missing from JS style attribute");
  }

  console.log("Scoped CSS Test Passed!");
}

try {
  testScopedCSS();
} catch (e) {
  console.error("Test Failed:", e);
  process.exit(1);
}
