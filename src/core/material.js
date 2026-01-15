/**
 * Defines the visual appearance of a scene object with colors for edges and faces.
 */
export class Material {
    // region Fields

    #originalEdgeColor;
    #originalEdgeGradientColor;
    #originalFaceColor;
    _edgeColor;
    _edgeGradientColor;
    _faceColor;

    // endregion

    // region Constructor

    /**
     * Creates a new Material.
     * @param {string|null} edgeColor - Primary edge color (hex string, e.g., '#ff00ff').
     * @param {string|null} edgeGradientColor - End color for gradient edges (hex string).
     * @param {string|null} faceColor - Fill color for the associated mesh's faces (hex string). Only visible with depth sorting.
     */
    constructor(edgeColor = null, edgeGradientColor = null, faceColor = null) {
        // Store original colors for reset functionality (immutable)
        this.#originalEdgeColor = edgeColor;
        this.#originalEdgeGradientColor = edgeGradientColor;
        this.#originalFaceColor = faceColor;

        // Mutable color properties
        this._edgeColor = edgeColor;
        this._edgeGradientColor = edgeGradientColor;
        this._faceColor = faceColor;
    }

    // endregion

    // region Getter Properties

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
     * Gets the gradient end color for edges.
     * @returns {string|null} The gradient end color (hex string) or null.
     */
    get edgeGradientColor() {
        return this._edgeGradientColor;
    }

    /**
     * Gets the face fill color.
     * @returns {string|null} The face fill color (hex string) or null.
     */
    get faceColor() {
        return this._faceColor;
    }

    // endregion

    // region Setter Properties

    /**
     * Sets the primary edge color.
     * @param {string|null} value - The edge color (hex string) or null.
     */
    set edgeColor(value) {
        this._edgeColor = value;
    }

    /**
     * Sets the gradient end color for edges.
     * @param {string|null} value - The gradient end color (hex string) or null.
     */
    set edgeGradientColor(value) {
        this._edgeGradientColor = value;
    }

    /**
     * Sets the face fill color.
     * @param {string|null} value - The face fill color (hex string) or null.
     */
    set faceColor(value) {
        this._faceColor = value;
    }

    // endregion

    // region Reset Methods

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

    // endregion
}
