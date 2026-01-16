/**
 * Tokenizes OBJ file content into a stream of tokens.
 * Produces tokens of type: KEYWORD, NUMBER, SLASH, NEWLINE, EOF.
 */
export class WavefrontLexer {
    // region Fields

    #source;
    #tokens;
    #start;
    #current;

    // endregion

    // region Constructor

    /**
     * Creates a new WavefrontLexer.
     * @param {string} source - The OBJ file content to tokenize.
     */
    constructor(source) {
        this.#source = source;
        this.#tokens = [];
        this.#start = 0;
        this.#current = 0;
    }

    // endregion

    // region Public Methods

    /**
     * Tokenizes all content and returns the token array.
     * @returns {Array<{type: string, value: *}>} Array of token objects.
     */
    lexTokens() {
        while (!this.#isAtEnd()) {
            this.#start = this.#current;
            this.#lexToken();
        }

        this.#tokens.push({type: 'EOF', value: null});
        return this.#tokens;
    }

    // endregion

    // region Private Lexing Methods

    /** @private */
    #lexToken() {
        const c = this.#advance();

        // Skip whitespace (except newlines)
        if (c === ' ' || c === '\t' || c === '\r')
            return;

        // Newline
        if (c === '\n') {
            this.#tokens.push({type: 'NEWLINE', value: '\n'});
            return;
        }

        // Comment - skip to end of line
        if (c === '#') {
            while (this.#peek() !== '\n' && !this.#isAtEnd())
                this.#advance();
            return;
        }

        // Slash (for face format like 1/2/3)
        if (c === '/') {
            this.#tokens.push({type: 'SLASH', value: '/'});
            return;
        }

        // Number (including negative)
        if (this.#isDigit(c) || (c === '-' && this.#isDigit(this.#peek()))) {
            this.#lexNumber();
            return;
        }

        // Keyword/identifier
        if (this.#isAlpha(c)) {
            this.#lexKeyword();
        }
    }

    /** @private */
    #lexNumber() {
        // Consume digits before decimal
        while (this.#isDigit(this.#peek()))
            this.#advance();

        // Look for decimal part
        if (this.#peek() === '.' && this.#isDigit(this.#peekNext())) {
            this.#advance(); // consume '.'

            while (this.#isDigit(this.#peek()))
                this.#advance();
        }

        // Handle scientific notation (e.g., 1.5e-10)
        if (this.#peek() === 'e' || this.#peek() === 'E') {
            this.#advance(); // consume 'e'

            if (this.#peek() === '+' || this.#peek() === '-')
                this.#advance(); // consume sign

            while (this.#isDigit(this.#peek()))
                this.#advance();
        }

        const value = parseFloat(this.#source.substring(this.#start, this.#current));
        this.#tokens.push({type: 'NUMBER', value: value});
    }

    /** @private */
    #lexKeyword() {
        while (this.#isAlphaNumeric(this.#peek()))
            this.#advance();

        const value = this.#source.substring(this.#start, this.#current);
        this.#tokens.push({type: 'KEYWORD', value: value});
    }

    // endregion

    // region Private Helper Methods

    /** @private */
    #advance() {
        return this.#source.charAt(this.#current++);
    }

    /** @private */
    #peek() {
        if (this.#isAtEnd())
            return '\0';

        return this.#source.charAt(this.#current);
    }

    /** @private */
    #peekNext() {
        if (this.#current + 1 >= this.#source.length)
            return '\0';

        return this.#source.charAt(this.#current + 1);
    }

    /** @private */
    #isAtEnd() {
        return this.#current >= this.#source.length;
    }

    /** @private */
    #isDigit(c) {
        return c >= '0' && c <= '9';
    }

    /** @private */
    #isAlpha(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    }

    /** @private */
    #isAlphaNumeric(c) {
        return this.#isAlpha(c) || this.#isDigit(c);
    }

    // endregion
}
