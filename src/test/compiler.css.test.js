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

function testMediaQueryCSS() {
  console.log("Running Media Query CSS Test");

  const source = `
component ResponsiveComp {
  view {
    div {
      style {
        width: "260px"
        padding: 24px
        @media (max-width: 768px) {
          width: "100%"
          padding: 16px
        }
      }
      content: "Responsive"
    }
  }
}
`;

  const compiler = new Compiler();
  const { css } = compiler.compile(source);

  if (!css.includes('width: 260px')) {
    throw new Error("Base width missing from CSS");
  }
  if (!css.includes('padding: 24px')) {
    throw new Error("Base padding missing from CSS");
  }
  if (!css.includes('@media (max-width: 768px)')) {
    throw new Error("@media rule missing from CSS");
  }
  if (!css.includes('width: 100%')) {
    throw new Error("Responsive width missing from @media rule");
  }
  if (!css.includes('padding: 16px')) {
    throw new Error("Responsive padding missing from @media rule");
  }

  // Both rules must share the same class name
  const classMatch = css.match(/\.(tela-ResponsiveComp-div-\d+)/);
  if (!classMatch) throw new Error("Scoped class name not found");
  const className = classMatch[1];
  const mediaMatch = css.match(/@media \(max-width: 768px\) \{ \.([\w-]+) \{/);
  if (!mediaMatch || mediaMatch[1] !== className) {
    throw new Error("@media rule does not use the same scoped class name");
  }

  console.log("Media Query CSS Test Passed!");
}

function testMediaQueryOnlyCSS() {
  console.log("Running Media Query Only CSS Test");

  const source = `
component MobileOnly {
  view {
    button {
      style {
        display: "none"
        @media (max-width: 768px) {
          display: "flex"
        }
      }
      content: "Menu"
    }
  }
}
`;

  const compiler = new Compiler();
  const { css } = compiler.compile(source);

  if (!css.includes('display: none')) throw new Error("Base display:none missing");
  if (!css.includes('@media (max-width: 768px)')) throw new Error("@media rule missing");
  if (!css.includes('display: flex')) throw new Error("display:flex in @media missing");

  console.log("Media Query Only CSS Test Passed!");
}

try {
  testScopedCSS();
  testMediaQueryCSS();
  testMediaQueryOnlyCSS();
} catch (e) {
  console.error("Test Failed:", e);
  process.exit(1);
}
