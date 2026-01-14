import {Material} from './material.js';

/**
 * An object with a position, rotation, scale, and mesh in the scene.
 */
export class SceneObject {
    #mesh;
    #transform;

    /**
     * Creates a new SceneObject.
     * @param {Mesh} mesh - The mesh geometry.
     * @param {Transform} transform - The position, rotation, and scale.
     * @param {string|null} color - Primary edge color (hex string, e.g., '#ff00ff').
     * @param {string|null} gradientColor - End color for gradient edges (hex string).
     * @param {string|null} faceColor - Fill color for faces (hex string). Only visible with depth sorting.
     */
    constructor(mesh, transform, material) {
        /** @type {Mesh} @private */
        this.#mesh = mesh;
        /** @type {Transform} @private */
        this.#transform = transform;

        // Mutable material property
        /** @type {Material} @private */
        this._material = material;
    }

    /**
     * Gets the mesh geometry.
     * @returns {Mesh} The mesh.
     */
    get mesh() {
        return this.#mesh;
    }

    /**
     * Gets the transform.
     * @returns {Transform} The transform.
     */
    get transform() {
        return this.#transform;
    }

    /**
     * Gets the material.
     * @returns {Material} The material.
     */
    get material() {
        return this._material;
    }

    /**
     * Sets the material.
     * @param {Material} value - The new material.
     */
    setMaterial(value) {
        if (value instanceof Material)
            this._material = value;
        else
            throw new Error('Material must be an instance of Material');
    }

    /**
     * Gets all vertices transformed to scene's world space.
     * Applies transformations in order: scale → rotate (X, Y, Z) → translate.
     * @returns {Vector3[]} Array of transformed vertex positions.
     */
    getSceneVertices() {
        return this.#mesh.getVertices().map(v =>
            v.getScaledByVector(this.#transform.scale)
                .getRotatedX(this.#transform.rotation.x)
                .getRotatedY(this.#transform.rotation.y)
                .getRotatedZ(this.#transform.rotation.z)
                .getTranslated(this.#transform.position)
        );
    }
}
