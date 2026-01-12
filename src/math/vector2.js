/**
 * A 2D vector class for screen coordinates and 2D math operations.
 * Methods return new instances (immutable style).
 */
export class Vector2 {
    /**
     * Creates a new Vector2.
     * @param {number} x - The x component.
     * @param {number} y - The y component.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Checks if both x and y are zero.
     * @returns {boolean} True if the vector is zero.
     */
    isZero() {
        return this.x === 0 && this.y === 0;
    }

    /**
     * Gets a unit vector pointing in the same direction.
     * @returns {Vector2} A new normalized vector.
     */
    getNormalized() {
        const mag = Math.sqrt(this.x * this.x + this.y * this.y);
        return new Vector2(this.x / mag, this.y / mag);
    }

    /**
     * Gets the length of the vector.
     * @returns {number} The magnitude.
     */
    getMagnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}
