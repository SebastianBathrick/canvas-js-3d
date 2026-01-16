import {WavefrontFileLoader} from './wavefront-file-loader.js';
import {WavefrontLexer} from './wavefront-lexer.js';
import {WavefrontParser} from './wavefront-parser.js';
import {Mesh} from '../core/mesh.js';

/**
 * High-level API for loading OBJ files and converting them to Mesh objects.
 * Orchestrates the file loading, lexing, and parsing pipeline.
 */
export class WavefrontMeshConverter {
    // region Static Loading Methods

    /**
     * Loads an OBJ file from a URL and converts it to a Mesh.
     * @param {string} url - The URL to fetch the OBJ file from.
     * @returns {Promise<Mesh>} The loaded mesh.
     */
    static async fromUrl(url) {
        const text = await WavefrontFileLoader.loadFromUrl(url);
        return this.fromText(text);
    }

    /**
     * Loads an OBJ file from a File object and converts it to a Mesh.
     * @param {File} file - The File object from an input element.
     * @returns {Promise<Mesh>} The loaded mesh.
     */
    static async fromFile(file) {
        const text = await WavefrontFileLoader.loadFromFile(file);
        return this.fromText(text);
    }

    /**
     * Opens a file dialog and converts the selected OBJ file to a Mesh.
     * @returns {Promise<Mesh>} The loaded mesh.
     */
    static async fromFileDialog() {
        const text = await WavefrontFileLoader.loadFromFileDialog();
        return this.fromText(text);
    }

    // endregion

    // region Static Conversion Methods

    /**
     * Converts OBJ text content directly to a Mesh.
     * @param {string} text - The OBJ file content as a string.
     * @returns {Mesh} The parsed mesh.
     */
    static fromText(text) {
        const lexer = new WavefrontLexer(text);
        const tokens = lexer.lexTokens();

        const parser = new WavefrontParser(tokens);
        const {vertices, faceIndices} = parser.parse();

        return new Mesh(vertices, faceIndices);
    }

    // endregion
}
