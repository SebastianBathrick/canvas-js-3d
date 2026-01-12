/**
 * Represents a 3D mesh with vertices and face index definitions.
 */
export class Mesh {
    /**
     * Creates a new Mesh.
     * @param {Vector3[]} vertices - Array of vertex positions.
     * @param {number[][]} faceIndices - Array of faces, each face is an array of vertex indices.
     */
    constructor(vertices, faceIndices) {
        /** @type {Vector3[]} */
        this.vertices = vertices;
        /** @type {number[][]} */
        this.faceIndices = faceIndices;
    }

    /**
     * Gets the vertices of the mesh.
     * @returns {Vector3[]} The vertex array.
     */
    getVertices() {
        return this.vertices;
    }

    /**
     * Gets the face indices of the mesh.
     * @returns {number[][]} Array of faces, each containing vertex indices.
     */
    getFaceIndices() {
        return this.faceIndices;
    }
}
