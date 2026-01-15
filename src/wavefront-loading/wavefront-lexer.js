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
        while (!this._isAtEnd()) {
            this._start = this._current;
            this._lexToken();
        }

        this._tokens.push({type: 'EOF', value: null});
        return this._tokens;
    }

    /** @private */
    _lexToken() {
        const c = this._advance();

        // Skip whitespace (except newlines)
        if (c === ' ' || c === '\t' || c === '\r')
            return;

        // Newline
        if (c === '\n') {
            this._tokens.push({type: 'NEWLINE', value: '\n'});
            return;
        }

        // Comment - skip to end of line
        if (c === '#') {
            while (this._peek() !== '\n' && !this._isAtEnd())
                this._advance();
            return;
        }

        // Slash (for face format like 1/2/3)
        if (c === '/') {
            this._tokens.push({type: 'SLASH', value: '/'});
            return;
        }

        // Number (including negative)
        if (this._isDigit(c) || (c === '-' && this._isDigit(this._peek()))) {
            this._lexNumber();
            return;
        }

        // Keyword/identifier
        if (this._isAlpha(c)) {
            this._lexKeyword();

        }
    }

    /** @private */
    _lexNumber() {
        // Consume digits before decimal
        while (this._isDigit(this._peek()))
            this._advance();

        // Look for decimal part
        if (this._peek() === '.' && this._isDigit(this._peekNext())) {
            this._advance(); // consume '.'

            while (this._isDigit(this._peek()))
                this._advance();
        }

        // Handle scientific notation (e.g., 1.5e-10)
        if (this._peek() === 'e' || this._peek() === 'E') {
            this._advance(); // consume 'e'

            if (this._peek() === '+' || this._peek() === '-')
                this._advance(); // consume sign

            while (this._isDigit(this._peek()))
                this._advance();
        }

        const value = parseFloat(this._source.substring(this._start, this._current));
        this._tokens.push({type: 'NUMBER', value: value});
    }

    /** @private */
    _lexKeyword() {
        while (this._isAlphaNumeric(this._peek()))
            this._advance();

        const value = this._source.substring(this._start, this._current);
        this._tokens.push({type: 'KEYWORD', value: value});
    }

    /** @private */
    _advance() {
        return this._source.charAt(this._current++);
    }

    /** @private */
    _peek() {
        if (this._isAtEnd())
            return '\0';

        return this._source.charAt(this._current);
    }

    /** @private */
    _peekNext() {
        if (this._current + 1 >= this._source.length)
            return '\0';

        return this._source.charAt(this._current + 1);
    }

    /** @private */
    _isAtEnd() {
        return this._current >= this._source.length;
    }

    /** @private */
    _isDigit(c) {
        return c >= '0' && c <= '9';
    }

    /** @private */
    _isAlpha(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    }

    /** @private */
    _isAlphaNumeric(c) {
        return this._isAlpha(c) || this._isDigit(c);
    }
}
