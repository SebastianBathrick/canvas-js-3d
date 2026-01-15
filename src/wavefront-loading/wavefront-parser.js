import {Vector3} from '../math/vector3.js';

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
        while (!this._isAtEnd()) {
            this._parseStatement();
        }

        return {
            vertices: this._vertices,
            faceIndices: this._faceIndices
        };
    }

    /** @private */
    _parseStatement() {
        const token = this._peek();

        // Skip newlines
        if (token.type === 'NEWLINE') {
            this._advance();
            return;
        }

        // Handle keywords
        if (token.type === 'KEYWORD') {
            const keyword = token.value;

            if (keyword === 'v') {
                this._advance(); // consume 'v'
                this._parseVertex();
            } else if (keyword === 'f') {
                this._advance(); // consume 'f'
                this._parseFace();
            } else {
                // Unknown keyword - skip to end of line
                this._skipToNextLine();
            }
            return;
        }

        // Skip anything else
        this._advance();
    }

    /** @private */
    _parseVertex() {
        const x = this._consumeNumber();
        const y = this._consumeNumber();
        const z = this._consumeNumber();

        this._vertices.push(new Vector3(x, y, z));
        this._skipToNextLine();
    }

    /** @private */
    _parseFace() {
        const indices = [];

        // Consume all vertex indices until newline or EOF
        while (!this._isAtEnd() && this._peek().type !== 'NEWLINE') {
            if (this._peek().type === 'NUMBER') {
                // Get vertex index (1-indexed in OBJ, convert to 0-indexed)
                const vertexIndex = this._consumeNumber() - 1;
                indices.push(vertexIndex);

                // Skip texture/normal indices (e.g., /2/3)
                while (this._peek().type === 'SLASH') {
                    this._advance(); // consume '/'

                    // Consume the index after slash if present
                    if (this._peek().type === 'NUMBER')
                        this._advance();
                }
            } else {
                this._advance();
            }
        }

        if (indices.length >= 3)
            this._faceIndices.push(indices);

        this._skipToNextLine();
    }

    /** @private */
    _consumeNumber() {
        const token = this._peek();

        if (token.type === 'NUMBER') {
            this._advance();
            return token.value;
        }

        // Return 0 if no number found (error case)
        return 0;
    }

    /** @private */
    _skipToNextLine() {
        while (!this._isAtEnd() && this._peek().type !== 'NEWLINE')
            this._advance();

        // Consume the newline
        if (!this._isAtEnd() && this._peek().type === 'NEWLINE')
            this._advance();
    }

    /** @private */
    _peek() {
        return this._tokens[this._current];
    }

    /** @private */
    _advance() {
        if (!this._isAtEnd())
            this._current++;

        return this._tokens[this._current - 1];
    }

    /** @private */
    _isAtEnd() {
        return this._current >= this._tokens.length || this._peek().type === 'EOF';
    }
}
