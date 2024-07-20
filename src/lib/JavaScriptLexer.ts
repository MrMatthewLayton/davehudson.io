import { Lexer } from './Lexer'

/**
 * Lexer for JavaScript code.
 */
export class JavaScriptLexer extends Lexer {
    /**
     * Gets the next token from the input.
     * @returns The next token, or null if end of input.
     */
    public override nextToken(): boolean {
        if (this.position >= this.input.length) {
            return false;
        }

        const ch = this.input[this.position];

        if (ch === '\n') {
            this.position++;
            this.tokenStream.push({ type: 'WHITESPACE_OR_NEWLINE', value: '\n' });
            return true;
        }

        if (/\s/.test(ch)) {
            this.readWhitespace();
            return true;
        }

        if (this.isLetter(ch) || ch === '_') {
            this.readIdentifierOrKeyword();
            return true;
        }

        if (this.isDigit(ch) || (ch === '.' && this.isDigit(this.input[this.position + 1]))) {
            this.readNumber();
            return true;
        }

        if (ch === '"' || ch === "'") {
            this.readString(ch);
            return true;
        }

        if (ch === '/' && this.input[this.position + 1] === '/') {
            this.readComment();
            return true;
        }

        if (ch === '/' && this.input[this.position + 1] === '*') {
            this.readBlockComment();
            return true;
        }

        this.readOperatorOrPunctuation();
        return true;
    }

    /**
     * Reads a number in the input.
     * @returns The number token.
     */
    protected override readNumber(): void {
        console.log('read number', this.position, this.input.slice(this.position, this.position + 5));
        let start = this.position;

        if (this.input[this.position] === '0') {
            this.position++; // Skip '0'
            if (this.position < this.input.length) {
                this.tokenStream.push({ type: 'NUMBER', value: this.input.slice(start, this.position) });
                return;
            }

            if (this.input[this.position] === 'x' || this.input[this.position] === 'X') {
                // Hexadecimal literal
                this.position++; // Skip "0x"
                while (this.position < this.input.length && /[0-9a-fA-F]/.test(this.input[this.position])) {
                    this.position++;
                }
            } else if (this.input[this.position] === 'b' || this.input[this.position] === 'B') {
                // Binary literal
                this.position++; // Skip "0b"
                while (this.position < this.input.length && /[01]/.test(this.input[this.position])) {
                    this.position++;
                }
            } else if (this.input[this.position] === 'o' || this.input[this.position] === 'O') {
                // Octal literal (ES6 syntax)
                this.position++; // Skip "0o"
                while (this.position < this.input.length && /[0-7]/.test(this.input[this.position])) {
                    this.position++;
                }
            } else if (/[0-7]/.test(this.input[this.position])) {
                // Legacy octal literal
                while (this.position < this.input.length && /[0-7]/.test(this.input[this.position])) {
                    this.position++;
                }
            }
        } else {
            console.log('here: ', this.position, this.input.slice(this.position, this.position + 5));
            while (this.position < this.input.length && /[0-9]/.test(this.input[this.position])) {
                this.position++;
            }

            if (this.position < this.input.length && this.input[this.position] === '.') {
                this.position++;
                while (this.position < this.input.length && /[0-9]/.test(this.input[this.position])) {
                    this.position++;
                }
            }

            if (this.position < this.input.length && (this.input[this.position] === 'e' || this.input[this.position] === 'E')) {
                this.position++;
                if (this.input[this.position] === '+' || this.input[this.position] === '-') {
                    this.position++;
                }
                while (this.position < this.input.length && /[0-9]/.test(this.input[this.position])) {
                    this.position++;
                }
            }
        }

        // Check for BigInt suffix
        if (this.position < this.input.length && this.input[this.position] === 'n') {
            this.position++;
        }

        console.log('output number', this.input.slice(start, this.position));
        if (this.position == start) debugger;
        this.tokenStream.push({ type: 'NUMBER', value: this.input.slice(start, this.position) });
    }

    /**
     * Reads whitespace in the input.
     * @returns The whitespace token.
     */
    protected override readWhitespace(): void {
        let start = this.position;
        while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
            this.position++;
        }

        this.tokenStream.push({ type: 'WHITESPACE_OR_NEWLINE', value: this.input.slice(start, this.position) });
    }

    /**
     * Reads an identifier or keyword in the input.
     * @returns The identifier or keyword token.
     */
    protected override readIdentifierOrKeyword(): void {
        let start = this.position;
        while (this.position < this.input.length && (this.isLetter(this.input[this.position]) || this.input[this.position] === '_')) {
            this.position++;
        }

        const value = this.input.slice(start, this.position);
        const type = this.isKeyword(value) ? 'KEYWORD' : 'IDENTIFIER';
        this.tokenStream.push({ type, value });
    }

    /**
     * Reads a comment in the input.
     * @returns The comment token.
     */
    protected override readComment(): void {
        let start = this.position;
        this.position += 2; // Skip "//"
        while (this.position < this.input.length && this.input[this.position] !== '\n') {
            this.position++;
        }

        this.tokenStream.push({ type: 'COMMENT', value: this.input.slice(start, this.position) });
    }

    /**
     * Reads a block comment in the input.
     * @returns The block comment token.
     */
    protected override readBlockComment(): void {
        let start = this.position;
        this.position += 2; // Skip "/*"
        while (this.position < this.input.length && !(this.input[this.position - 1] === '*' && this.input[this.position] === '/')) {
            this.position++;
        }

        this.position++; // Skip '/'
        this.tokenStream.push({ type: 'COMMENT', value: this.input.slice(start, this.position) });
    }

    /**
     * Checks if a character is a letter.
     * @param ch - The character to check.
     * @returns True if the character is a letter, false otherwise.
     */
    protected override isLetter(ch: string): boolean {
        return /[a-zA-Z]/.test(ch);
    }

    /**
     * Determines if a value is a keyword in JavaScript.
     * @param value - The value to check.
     * @returns True if the value is a keyword, false otherwise.
     */
    protected override isKeyword(value: string): boolean {
        const keywords = [
            'abstract',
            'async',
            'await',
            'boolean',
            'break',
            'byte',
            'case',
            'catch',
            'char',
            'class',
            'const',
            'continue',
            'debugger',
            'default',
            'delete',
            'do',
            'double',
            'else',
            'enum',
            'export',
            'extends',
            'false',
            'final',
            'finally',
            'float',
            'for',
            'from',
            'function',
            'goto',
            'if',
            'implements',
            'import',
            'in',
            'instanceof',
            'int',
            'interface',
            'let',
            'long',
            'native',
            'new',
            'null',
            'package',
            'private',
            'protected',
            'public',
            'return',
            'short',
            'static',
            'super',
            'switch',
            'synchronized',
            'this',
            'throw',
            'throws',
            'transient',
            'true',
            'try',
            'typeof',
            'var',
            'void',
            'volatile',
            'while',
            'with',
            'yield'
        ];
        return keywords.includes(value);
    }
}
