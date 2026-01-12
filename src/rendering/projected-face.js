/**
 * Represents a face that has been projected to screen space.
 */
export class ProjectedFace {
    /**
     * Creates a new ProjectedFace.
     * @param {Vector2[]} screenPositions - The projected vertex positions in screen coordinates.
     * @param {number} depth - The average depth (Z) in camera space for sorting.
     */
    constructor(screenPositions, depth) {
        /** @type {Vector2[]} */
        this.screenPositions = screenPositions;
        /** @type {number} */
        this.depth = depth;
    }

    /**
     * Comparison function for sorting faces back-to-front (larger depth first).
     * @param {ProjectedFace} a - First face to compare.
     * @param {ProjectedFace} b - Second face to compare.
     * @returns {number} Negative if a should come first, positive if b should come first.
     */
    static compareByDepth(a, b) {
        return b.depth - a.depth;
    }
}
