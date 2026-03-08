
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const assert = require('assert');

const tempDir = path.join(__dirname, 'temp_cli_test');
const telaBin = path.resolve(__dirname, '../../bin/tela.js');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const sourceFile = path.join(tempDir, 'TestComponent.tela');
const sourceContent = `
component TestComponent {
  state count: Number = 0
  view {
    div {
      content: "Count: \${count}"
    }
  }
}
`;

fs.writeFileSync(sourceFile, sourceContent);

console.log("Running CLI Test...");

try {
  // Execute CLI
  execSync(`node ${telaBin} compile ${sourceFile}`, { stdio: 'inherit' });

  const jsFile = path.join(tempDir, 'TestComponent.js');
  const cssFile = path.join(tempDir, 'TestComponent.css');

  // Verify outputs
  if (!fs.existsSync(jsFile)) throw new Error("JS output file missing");
  if (!fs.existsSync(cssFile)) throw new Error("CSS output file missing");

  const jsContent = fs.readFileSync(jsFile, 'utf8');
  if (!jsContent.includes('TestComponent')) throw new Error("JS content missing component definition");
  
  console.log("CLI Test Passed!");

} catch (error) {
  console.error("CLI Test Failed:", error);
  process.exit(1);
} finally {
  // Cleanup
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
