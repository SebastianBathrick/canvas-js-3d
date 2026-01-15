/**
 * Defines the visual appearance of a scene object with colors for edges and faces.
 */
export class Material {
    #originalEdgeColor;
    #originalEdgeGradientColor;
    #originalFaceColor;

    /**
     * Creates a new Material.
     * @param {string|null} edgeColor - Primary edge color (hex string, e.g., '#ff00ff').
     * @param {string|null} edgeGradientColor - End color for gradient edges (hex string).
     * @param {string|null} faceColor - Fill color for the associated mesh's faces (hex string). Only visible with depth sorting.
     */
    constructor(edgeColor = null, edgeGradientColor = null, faceColor = null) {
        // Store original colors for reset functionality (immutable)
        /** @type {string|null} @private */
        this.#originalEdgeColor = edgeColor;
        /** @type {string|null} @private */
        this.#originalEdgeGradientColor = edgeGradientColor;
        /** @type {string|null} @private */
        this.#originalFaceColor = faceColor;

        // Mutable color properties
        /** @type {string|null} Primary edge color @private */
        this._edgeColor = edgeColor;
        /** @type {string|null} End color for gradient edges @private */
        this._edgeGradientColor = edgeGradientColor;
        /** @type {string|null} Fill color for faces @private */
        this._faceColor = faceColor;
    }

    /**
     * Gets the original color from construction.
     * @returns {string|null} The original color (hex string) or null.
     */
    get originalEdgeColor() {
        return this.#originalEdgeColor;
    }

    /**
     * Gets the original gradient color from construction.
     * @returns {string|null} The original gradient color (hex string) or null.
     */
    get originalEdgeGradientColor() {
        return this.#originalEdgeGradientColor;
    }

    /**
     * Gets the original face color from construction.
     * @returns {string|null} The original face color (hex string) or null.
     */
    get originalFaceColor() {
        return this.#originalFaceColor;
    }

    /**
     * Gets the primary edge color.
     * @returns {string|null} The edge color (hex string) or null.
     */
    get edgeColor() {
        return this._edgeColor;
    }

    /**
     * Sets the primary edge color.
     * @param {string|null} value - The edge color (hex string) or null.
     */
    setEdgeColor(value) {
        this._edgeColor = value;
    }

    /**
     * Gets the gradient end color for edges.
     * @returns {string|null} The gradient end color (hex string) or null.
     */
    get edgeGradientColor() {
        return this._edgeGradientColor;
    }

    /**
     * Sets the gradient end color for edges.
     * @param {string|null} value - The gradient end color (hex string) or null.
     */
    setEdgeGradientColor(value) {
        this._edgeGradientColor = value;
    }

    /**
     * Gets the face fill color.
     * @returns {string|null} The face fill color (hex string) or null.
     */
    get faceColor() {
        return this._faceColor;
    }

    /**
     * Sets the face fill color.
     * @param {string|null} value - The face fill color (hex string) or null.
     */
    setFaceColor(value) {
        this._faceColor = value;
    }

    /**
     * Resets the primary edge color to its original value from construction.
     */
    resetEdgeColor() {
        this._edgeColor = this.#originalEdgeColor;
    }

    /**
     * Resets the gradient color to its original value from construction.
     */
    resetEdgeGradientColor() {
        this._edgeGradientColor = this.#originalEdgeGradientColor;
    }

    /**
     * Resets the face color to its original value from construction.
     */
    resetFaceColor() {
        this._faceColor = this.#originalFaceColor;
    }
}
