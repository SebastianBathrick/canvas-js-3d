/**
 * Represents a face that has been projected to screen space.
 */
export class ProjectedFace {
    /**
     * Creates a new ProjectedFace.
     * @param {Vector2[]} screenPositions - The projected vertex positions in screen coordinates.
     * @param {number} depth - The average depth (Z) in camera space for sorting.
     * @param {string|null} color - Primary edge color (hex string).
     * @param {string|null} gradientColor - End color for gradient edges (hex string).
     */
    constructor(screenPositions, depth, color = null, gradientColor = null) {
        /** @type {Vector2[]} */
        this.screenPositions = screenPositions;
        /** @type {number} */
        this.depth = depth;
        /** @type {string|null} */
        this.color = color;
        /** @type {string|null} */
        this.gradientColor = gradientColor;
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
