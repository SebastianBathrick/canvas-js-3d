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
     */
    constructor(mesh, transform, color = null, gradientColor = null) {
        this.mesh = mesh;
        this.transform = transform;
        /** @type {string|null} Primary edge color */
        this.color = color;
        /** @type {string|null} End color for gradient edges */
        this.gradientColor = gradientColor;
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
