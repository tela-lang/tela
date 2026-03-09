const { TokenType, Keywords } = require('./token-types');

class Tokenizer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  tokenize() {
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      // Skip Whitespace
      if (/\s/.test(char)) {
        this.consumeWhitespace();
        continue;
      }

      // Skip Comments
      if (char === '/' && this.input[this.position + 1] === '/') {
        this.consumeComment();
        continue;
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        this.tokens.push(this.readNumber());
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        this.tokens.push(this.readString(char));
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_@]/.test(char)) {
        this.tokens.push(this.readIdentifier());
        continue;
      }

      // Operators and Punctuation
      if (this.isPunctuation(char) || this.isOperatorStart(char)) {
        this.tokens.push(this.readOperatorOrPunctuation());
        continue;
      }

      throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
    }

    this.tokens.push({ type: TokenType.EOF, value: null, line: this.line, column: this.column });
    return this.tokens;
  }

  consumeWhitespace() {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  consumeComment() {
    // Skip until newline
    while (this.position < this.input.length && this.input[this.position] !== '\n') {
      this.position++;
      this.column++;
    }
  }

  readNumber() {
    const startColumn = this.column;
    let value = '';
    
    while (this.position < this.input.length && /[0-9.]/.test(this.input[this.position])) {
      value += this.input[this.position];
      this.advance();
    }

    return { type: TokenType.NUMBER, value: Number(value), line: this.line, column: startColumn };
  }

  readString(quote) {
    const startColumn = this.column;
    this.advance(); // Skip opening quote
    let value = '';

    while (this.position < this.input.length && this.input[this.position] !== quote) {
      if (this.input[this.position] === '\n') {
        throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
      }
      if (this.input[this.position] === '\\') {
        this.advance();
        const esc = this.input[this.position];
        if (esc === 'n') value += '\n';
        else if (esc === 't') value += '\t';
        else if (esc === '\\') value += '\\';
        else if (esc === '"') value += '"';
        else if (esc === "'") value += "'";
        else value += esc;
        this.advance();
        continue;
      }
      value += this.input[this.position];
      this.advance();
    }

    if (this.position >= this.input.length) {
      throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
    }

    this.advance(); // Skip closing quote
    return { type: TokenType.STRING, value, line: this.line, column: startColumn };
  }

  readIdentifier() {
    const startColumn = this.column;
    let value = '';

    // Allow @ for event handlers like @click
    // Allow - for CSS properties like background-color
    while (this.position < this.input.length && /[a-zA-Z0-9_@-]/.test(this.input[this.position])) {
      value += this.input[this.position];
      this.advance();
    }

    const type = Keywords.includes(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
    
    // Special handling for boolean literals
    if (value === 'true' || value === 'false') {
        return { type: TokenType.BOOLEAN, value: value === 'true', line: this.line, column: startColumn };
    }

    return { type, value, line: this.line, column: startColumn };
  }

  readOperatorOrPunctuation() {
    const startColumn = this.column;
    const char = this.input[this.position];
    
    // Check for 3-character operators first
    if (this.position + 2 < this.input.length) {
      const threeChar = char + this.input[this.position + 1] + this.input[this.position + 2];
      if (['===', '!=='].includes(threeChar)) {
        this.advance(); this.advance(); this.advance();
        return { type: TokenType.OPERATOR, value: threeChar, line: this.line, column: startColumn };
      }
    }

    // Check for 2-character operators
    if (this.position + 1 < this.input.length) {
      const twoChar = char + this.input[this.position + 1];
      if (['==', '!=', '>=', '<=', '=>', '&&', '||', '?.', '??'].includes(twoChar)) {
        this.advance();
        this.advance();
        return { type: TokenType.OPERATOR, value: twoChar, line: this.line, column: startColumn };
      }
    }

    this.advance();

    if (['{', '}', '(', ')', '[', ']', ',', '.', ':', ';'].includes(char)) {
      return { type: TokenType.PUNCTUATION, value: char, line: this.line, column: startColumn };
    }

    return { type: TokenType.OPERATOR, value: char, line: this.line, column: startColumn };
  }

  isPunctuation(char) {
    return /[{}(),.[\]:;]/.test(char);
  }

  isOperatorStart(char) {
    return /[+\-*/=<>!&|?]/.test(char);
  }

  advance() {
    this.position++;
    this.column++;
  }
}

module.exports = { Tokenizer };
