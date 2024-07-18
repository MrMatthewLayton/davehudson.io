import { Token, Lexer } from './Lexer'

/**
 * Lexer for C code.
 */
export class CLexer extends Lexer {
    /**
     * Determines if a value is a keyword in C.
     * @param value - The value to check.
     * @returns True if the value is a keyword, false otherwise.
     */
    protected override isKeyword(value: string): boolean {
        const keywords = [
            'auto',
            'break',
            'case',
            'char',
            'const',
            'continue',
            'default',
            'do',
            'double',
            'else',
            'enum',
            'extern',
            'float',
            'for',
            'goto',
            'if',
            'inline',
            'int',
            'long',
            'register',
            'restrict',
            'return',
            'short',
            'signed',
            'sizeof',
            'static',
            'struct',
            'switch',
            'typedef',
            'union',
            'unsigned',
            'void',
            'volatile',
            'while',
            '_Bool',
            '_Complex',
            '_Imaginary'
        ];
        return keywords.includes(value);
    }

    /**
     * Reads an identifier or keyword token in C.
     * @returns The identifier or keyword token.
     */
    protected override readIdentifierOrKeyword(): Token {
        const start = this.position;
        while (this.isLetterOrDigit(this.input[this.position])) {
            this.position++;
        }

        const value = this.input.slice(start, this.position);
        const type = this.isKeyword(value) ? 'KEYWORD' : 'IDENTIFIER';
        return { type, value };
    }

    /**
     * Reads a preprocessor directive token in C.
     * @returns The preprocessor directive token.
     */
    protected readPreprocessorDirective(): Token {
        const start = this.position;
        while (this.position < this.input.length && this.input[this.position] !== '\n') {
            this.position++;
        }

        return { type: 'PREPROCESSOR', value: this.input.slice(start, this.position) };
    }

    /**
     * Gets the next token from the input.
     * @returns The next token, or null if end of input.
     */
    public override nextToken(): Token | null {
        if (this.position >= this.input.length) {
            return null;
        }

        const ch = this.input[this.position];

        if (ch === '#') {
            return this.readPreprocessorDirective();
        }

        return super.nextToken();
    }
}