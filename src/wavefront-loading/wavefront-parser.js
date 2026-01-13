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
        this._tokens = tokens;
        /** @type {number} */
        this._current = 0;
        /** @type {Vector3[]} */
        this._vertices = [];
        /** @type {number[][]} */
        this._faceIndices = [];
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
            vertices: this._vertices,
            faceIndices: this._faceIndices
        };
    }

    /** @private */
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

    /** @private */
    parseVertex() {
        const x = this.consumeNumber();
        const y = this.consumeNumber();
        const z = this.consumeNumber();

        this._vertices.push(new Vector3(x, y, z));
        this.skipToNextLine();
    }

    /** @private */
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
            this._faceIndices.push(indices);

        this.skipToNextLine();
    }

    /** @private */
    consumeNumber() {
        const token = this.peek();

        if (token.type === 'NUMBER') {
            this.advance();
            return token.value;
        }

        // Return 0 if no number found (error case)
        return 0;
    }

    /** @private */
    skipToNextLine() {
        while (!this.isAtEnd() && this.peek().type !== 'NEWLINE')
            this.advance();

        // Consume the newline
        if (!this.isAtEnd() && this.peek().type === 'NEWLINE')
            this.advance();
    }

    /** @private */
    peek() {
        return this._tokens[this._current];
    }

    /** @private */
    advance() {
        if (!this.isAtEnd())
            this._current++;

        return this._tokens[this._current - 1];
    }

    /** @private */
    isAtEnd() {
        return this._current >= this._tokens.length || this.peek().type === 'EOF';
    }
}
