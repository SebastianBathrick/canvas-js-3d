/**
 * An object with a position, rotation, scale, and mesh in the scene.
 */
export class SceneObject {
    /**
     * Creates a new SceneObject.
     * @param {Mesh} mesh - The mesh geometry.
     * @param {Transform} transform - The position, rotation, and scale.
     * @param {string|null} color - Primary edge color (hex string, e.g., '#ff00ff').
     * @param {string|null} gradientColor - End color for gradient edges (hex string).
     * @param {string|null} faceColor - Fill color for faces (hex string). Only visible with depth sorting.
     */
    constructor(mesh, transform, color = null, gradientColor = null, faceColor = null) {
        this.mesh = mesh;
        this.transform = transform;

        // Store original colors for reset functionality
        /** @type {string|null} @private */
        this._originalColor = color;
        /** @type {string|null} @private */
        this._originalGradientColor = gradientColor;
        /** @type {string|null} @private */
        this._originalFaceColor = faceColor;

        // Private color properties
        /** @type {string|null} Primary edge color @private */
        this._color = color;
        /** @type {string|null} End color for gradient edges @private */
        this._gradientColor = gradientColor;
        /** @type {string|null} Fill color for faces @private */
        this._faceColor = faceColor;
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
    set color(value) {
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
    set gradientColor(value) {
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
    set faceColor(value) {
        this._faceColor = value;
    }

    /**
     * Resets the primary edge color to its original value from construction.
     */
    resetColor() {
        this._color = this._originalColor;
    }

    /**
     * Resets the gradient color to its original value from construction.
     */
    resetGradientColor() {
        this._gradientColor = this._originalGradientColor;
    }

    /**
     * Resets the face color to its original value from construction.
     */
    resetFaceColor() {
        this._faceColor = this._originalFaceColor;
    }

    /**
     * Resets all colors (edge, gradient, and face) to their original values from construction.
     */
    resetAllColors() {
        this.resetColor();
        this.resetGradientColor();
        this.resetFaceColor();
    }

    /**
     * Gets all vertices transformed to scene's world space.
     * Applies transformations in order: scale → rotate (X, Y, Z) → translate.
     * @returns {Vector3[]} Array of transformed vertex positions.
     */
    getSceneVertices() {
        return this.mesh.getVertices().map(v =>
            v.getScaledByVector(this.transform.scale)
             .getRotatedX(this.transform.rotation.x)
             .getRotatedY(this.transform.rotation.y)
             .getRotatedZ(this.transform.rotation.z)
             .getTranslated(this.transform.position)
        );
    }
}
