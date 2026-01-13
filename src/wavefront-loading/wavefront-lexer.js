/**
 * Tokenizes OBJ file content into a stream of tokens.
 * Produces tokens of type: KEYWORD, NUMBER, SLASH, NEWLINE, EOF.
 */
export class WavefrontLexer {
    /**
     * Creates a new WavefrontLexer.
     * @param {string} source - The OBJ file content to tokenize.
     */
    constructor(source) {
        /** @type {string} */
        this._source = source;
        /** @type {Array<{type: string, value: *}>} */
        this._tokens = [];
        /** @type {number} */
        this._start = 0;
        /** @type {number} */
        this._current = 0;
    }

    /**
     * Tokenizes all content and returns the token array.
     * @returns {Array<{type: string, value: *}>} Array of token objects.
     */
    lexTokens() {
        while (!this.isAtEnd()) {
            this._start = this._current;
            this.lexToken();
        }

        this._tokens.push({ type: 'EOF', value: null });
        return this._tokens;
    }

    /** @private */
    lexToken() {
        const c = this.advance();

        // Skip whitespace (except newlines)
        if (c === ' ' || c === '\t' || c === '\r')
            return;

        // Newline
        if (c === '\n') {
            this._tokens.push({ type: 'NEWLINE', value: '\n' });
            return;
        }

        // Comment - skip to end of line
        if (c === '#') {
            while (this.peek() !== '\n' && !this.isAtEnd())
                this.advance();
            return;
        }

        // Slash (for face format like 1/2/3)
        if (c === '/') {
            this._tokens.push({ type: 'SLASH', value: '/' });
            return;
        }

        // Number (including negative)
        if (this.isDigit(c) || (c === '-' && this.isDigit(this.peek()))) {
            this.lexNumber();
            return;
        }

        // Keyword/identifier
        if (this.isAlpha(c)) {
            this.lexKeyword();
            return;
        }
    }

    /** @private */
    lexNumber() {
        // Consume digits before decimal
        while (this.isDigit(this.peek()))
            this.advance();

        // Look for decimal part
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance(); // consume '.'

            while (this.isDigit(this.peek()))
                this.advance();
        }

        // Handle scientific notation (e.g., 1.5e-10)
        if (this.peek() === 'e' || this.peek() === 'E') {
            this.advance(); // consume 'e'

            if (this.peek() === '+' || this.peek() === '-')
                this.advance(); // consume sign

            while (this.isDigit(this.peek()))
                this.advance();
        }

        const value = parseFloat(this._source.substring(this._start, this._current));
        this._tokens.push({ type: 'NUMBER', value: value });
    }

    /** @private */
    lexKeyword() {
        while (this.isAlphaNumeric(this.peek()))
            this.advance();

        const value = this._source.substring(this._start, this._current);
        this._tokens.push({ type: 'KEYWORD', value: value });
    }

    /** @private */
    advance() {
        return this._source.charAt(this._current++);
    }

    /** @private */
    peek() {
        if (this.isAtEnd())
            return '\0';

        return this._source.charAt(this._current);
    }

    /** @private */
    peekNext() {
        if (this._current + 1 >= this._source.length)
            return '\0';

        return this._source.charAt(this._current + 1);
    }

    /** @private */
    isAtEnd() {
        return this._current >= this._source.length;
    }

    /** @private */
    isDigit(c) {
        return c >= '0' && c <= '9';
    }

    /** @private */
    isAlpha(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    }

    /** @private */
    isAlphaNumeric(c) {
        return this.isAlpha(c) || this.isDigit(c);
    }
}
