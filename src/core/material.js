/**
 * Defines the visual appearance of a scene object with colors for edges and faces.
 */
export class Material {
    #originalColor;
    #originalGradientColor;
    #originalFaceColor;

    /**
     * Creates a new Material.
     * @param {string|null} color - Primary edge color (hex string, e.g., '#ff00ff').
     * @param {string|null} gradientColor - End color for gradient edges (hex string).
     * @param {string|null} faceColor - Fill color for faces (hex string). Only visible with depth sorting.
     */
    constructor(color = null, gradientColor = null, faceColor = null) {
        // Store original colors for reset functionality (immutable)
        /** @type {string|null} @private */
        this.#originalColor = color;
        /** @type {string|null} @private */
        this.#originalGradientColor = gradientColor;
        /** @type {string|null} @private */
        this.#originalFaceColor = faceColor;

        // Mutable color properties
        /** @type {string|null} Primary edge color @private */
        this._color = color;
        /** @type {string|null} End color for gradient edges @private */
        this._gradientColor = gradientColor;
        /** @type {string|null} Fill color for faces @private */
        this._faceColor = faceColor;
    }

    /**
     * Gets the original color from construction.
     * @returns {string|null} The original color (hex string) or null.
     */
    get originalColor() {
        return this.#originalColor;
    }

    /**
     * Gets the original gradient color from construction.
     * @returns {string|null} The original gradient color (hex string) or null.
     */
    get originalGradientColor() {
        return this.#originalGradientColor;
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
    get color() {
        return this._color;
    }

    /**
     * Sets the primary edge color.
     * @param {string|null} value - The edge color (hex string) or null.
     */
    setColor(value) {
        this._color = value;
    }

    /**
     * Gets the gradient end color for edges.
     * @returns {string|null} The gradient end color (hex string) or null.
     */
    get gradientColor() {
        return this._gradientColor;
    }

    /**
     * Sets the gradient end color for edges.
     * @param {string|null} value - The gradient end color (hex string) or null.
     */
    setGradientColor(value) {
        this._gradientColor = value;
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
    resetColor() {
        this._color = this.#originalColor;
    }

    /**
     * Resets the gradient color to its original value from construction.
     */
    resetGradientColor() {
        this._gradientColor = this.#originalGradientColor;
    }

    /**
     * Resets the face color to its original value from construction.
     */
    resetFaceColor() {
        this._faceColor = this.#originalFaceColor;
    }

    /**
     * Resets all colors (edge, gradient, and face) to their original values from construction.
     */
    resetAllColors() {
        this.resetColor();
        this.resetGradientColor();
        this.resetFaceColor();
    }
}
