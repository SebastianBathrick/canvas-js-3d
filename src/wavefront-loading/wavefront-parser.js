import { Vector3 } from '../math/vector3.js';

/**
 * Parses OBJ tokens into vertices and face indices.
 * Handles 'v' (vertex) and 'f' (face) keywords, ignoring texture coords and normals.
 */
export class WavefrontParser {
    /**
     * Creates a new WavefrontParser.
     * @param {Array<{type: string, value: *}>} tokens - The tokens from WavefrontLexer.
     */
    constructor(tokens) {
        /** @type {Array<{type: string, value: *}>} */
        this.tokens = tokens;
        /** @type {number} */
        this.current = 0;
        /** @type {Vector3[]} */
        this.vertices = [];
        /** @type {number[][]} */
        this.faceIndices = [];
    }

    /**
     * Parses all tokens and returns the extracted mesh data.
     * @returns {{vertices: Vector3[], faceIndices: number[][]}} The parsed mesh data.
     */
    parse() {
        while (!this.isAtEnd()) {
            this.parseStatement();
        }

        return {
            vertices: this.vertices,
            faceIndices: this.faceIndices
        };
    }

    /**
     * Parses a single statement (line).
     * @private
     */
    parseStatement() {
        const token = this.peek();

        // Skip newlines
        if (token.type === 'NEWLINE') {
            this.advance();
            return;
        }

        // Handle keywords
        if (token.type === 'KEYWORD') {
            const keyword = token.value;

            if (keyword === 'v') {
                this.advance(); // consume 'v'
                this.parseVertex();
            } else if (keyword === 'f') {
                this.advance(); // consume 'f'
                this.parseFace();
            } else {
                // Unknown keyword - skip to end of line
                this.skipToNextLine();
            }
            return;
        }

        // Skip anything else
        this.advance();
    }

    /**
     * Parses a vertex definition (v x y z).
     * @private
     */
    parseVertex() {
        const x = this.consumeNumber();
        const y = this.consumeNumber();
        const z = this.consumeNumber();

        this.vertices.push(new Vector3(x, y, z));
        this.skipToNextLine();
    }

    /**
     * Parses a face definition (f v1 v2 v3 ... or f v1/vt1/vn1 ...).
     * Converts OBJ's 1-indexed vertices to 0-indexed.
     * @private
     */
    parseFace() {
        const indices = [];

        // Consume all vertex indices until newline or EOF
        while (!this.isAtEnd() && this.peek().type !== 'NEWLINE') {
            if (this.peek().type === 'NUMBER') {
                // Get vertex index (1-indexed in OBJ, convert to 0-indexed)
                const vertexIndex = this.consumeNumber() - 1;
                indices.push(vertexIndex);

                // Skip texture/normal indices (e.g., /2/3)
                while (this.peek().type === 'SLASH') {
                    this.advance(); // consume '/'

                    // Consume the index after slash if present
                    if (this.peek().type === 'NUMBER')
                        this.advance();
                }
            } else {
                this.advance();
            }
        }

        if (indices.length >= 3)
            this.faceIndices.push(indices);

        this.skipToNextLine();
    }

    /**
     * Consumes and returns a number token value.
     * @returns {number} The number value, or 0 if not a number token.
     * @private
     */
    consumeNumber() {
        const token = this.peek();

        if (token.type === 'NUMBER') {
            this.advance();
            return token.value;
        }

        // Return 0 if no number found (error case)
        return 0;
    }

    /**
     * Skips tokens until the next newline or EOF.
     * @private
     */
    skipToNextLine() {
        while (!this.isAtEnd() && this.peek().type !== 'NEWLINE')
            this.advance();

        // Consume the newline
        if (!this.isAtEnd() && this.peek().type === 'NEWLINE')
            this.advance();
    }

    /**
     * Returns the current token without advancing.
     * @returns {{type: string, value: *}} The current token.
     * @private
     */
    peek() {
        return this.tokens[this.current];
    }

    /**
     * Returns the current token and advances the position.
     * @returns {{type: string, value: *}} The current token.
     * @private
     */
    advance() {
        if (!this.isAtEnd())
            this.current++;

        return this.tokens[this.current - 1];
    }

    /**
     * Checks if we've reached the end of tokens.
     * @returns {boolean} True if at end or at EOF token.
     * @private
     */
    isAtEnd() {
        return this.current >= this.tokens.length || this.peek().type === 'EOF';
    }
}
