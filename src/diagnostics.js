const Severity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const ErrorCodes = {
  E001: 'Unexpected token',
  E002: 'Expected token not found',
  E003: 'Unterminated block',
  E004: 'Unknown keyword',
  E005: 'Duplicate component name',
  E006: 'Missing view block',
  W001: 'State variable declared but never used',
  W002: 'Prop declared but never used',
};

class Diagnostic {
  constructor(severity, code, message, line, column, hint = null) {
    this.severity = severity;
    this.code = code;
    this.message = message;
    this.line = line;
    this.column = column;
    this.hint = hint;
  }

  toString() {
    const loc = this.line != null ? ` at line ${this.line}, column ${this.column}` : '';
    const hint = this.hint ? `\n  Hint: ${this.hint}` : '';
    const icon = this.severity === Severity.ERROR ? '✗ Error' : '⚠ Warning';
    return `${icon} [${this.code}] ${this.message}${loc}${hint}`;
  }
}

function makeError(code, message, line, column, hint = null) {
  return new Diagnostic(Severity.ERROR, code, message, line, column, hint);
}

function makeWarning(code, message, line, column, hint = null) {
  return new Diagnostic(Severity.WARNING, code, message, line, column, hint);
}

module.exports = { Severity, ErrorCodes, Diagnostic, makeError, makeWarning };
