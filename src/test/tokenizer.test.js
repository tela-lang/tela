const { Tokenizer } = require('../tokenizer');
const { TokenType } = require('../token-types');

const sourceCode = `
component Counter {
  state count: Number = 0

  view {
    Container {
      style {
        padding: 20px
        background-color: "white"
      }
      
      Button {
        @click: increment
      }
    }
  }
}
`;

function testTokenizer() {
  console.log("Starting Tokenizer Test...");
  
  try {
    const tokenizer = new Tokenizer(sourceCode);
    const tokens = tokenizer.tokenize();
    
    console.log(`Successfully tokenized ${tokens.length} tokens.`);
    
    // Basic assertions
    const expectedTokens = [
      { type: TokenType.KEYWORD, value: 'component' },
      { type: TokenType.IDENTIFIER, value: 'Counter' },
      { type: TokenType.PUNCTUATION, value: '{' },
      { type: TokenType.KEYWORD, value: 'state' },
      { type: TokenType.IDENTIFIER, value: 'count' },
      { type: TokenType.PUNCTUATION, value: ':' },
      { type: TokenType.IDENTIFIER, value: 'Number' },
      { type: TokenType.OPERATOR, value: '=' },
      { type: TokenType.NUMBER, value: 0 },
      // ... more tokens
    ];

    let passed = true;
    for (let i = 0; i < expectedTokens.length; i++) {
      const expected = expectedTokens[i];
      const actual = tokens[i];
      
      if (actual.type !== expected.type || actual.value !== expected.value) {
        console.error(`Mismatch at token ${i}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        passed = false;
      }
    }

    // Check for CSS property with hyphen
    const bgColorToken = tokens.find(t => t.value === 'background-color');
    if (!bgColorToken) {
        console.error("Failed to tokenize hyphenated identifier 'background-color'");
        passed = false;
    }

    // Check for @click
    const clickToken = tokens.find(t => t.value === '@click');
    if (!clickToken) {
        console.error("Failed to tokenize event handler '@click'");
        passed = false;
    }

    if (passed) {
      console.log("Test Passed!");
    } else {
      console.log("Test Failed.");
      process.exit(1);
    }
    
    // Log all tokens for manual inspection
    // console.log(JSON.stringify(tokens, null, 2));

  } catch (error) {
    console.error("Tokenizer crashed:", error);
    process.exit(1);
  }
}

testTokenizer();
