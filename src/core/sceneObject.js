/**
 * An object with a position, rotation, scale, and mesh in the scene.
 */
export class SceneObject {
    /**
     * Creates a new SceneObject.
     * @param {Mesh} mesh - The mesh geometry.
     * @param {Transform} transform - The position, rotation, and scale.
     */
    constructor(mesh, transform) {
        /** @type {Mesh} */
        this.mesh = mesh;
        /** @type {Transform} */
        this.transform = transform;
    }

    /**
     * Gets the mesh geometry.
     * @returns {Mesh} The mesh.
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * Gets the transform.
     * @returns {Transform} The transform.
     */
    getTransform() {
        return this.transform;
    }

    /**
     * Gets all vertices transformed to scene's world space.
     * Applies transformations in order: scale → rotate (X, Y, Z) → translate.
     * @returns {Vector3[]} Array of transformed vertex positions.
     */
    getSceneVertices() {
        return this.mesh.vertices.map(v =>
            v.getScaledByVector(this.transform.scale)
             .getRotatedX(this.transform.rotation.x)
             .getRotatedY(this.transform.rotation.y)
             .getRotatedZ(this.transform.rotation.z)
             .getTranslated(this.transform.position)
        );
    }
}
