/**
 * A 2D vector class for screen coordinates and 2D math operations. This class is immutable.
 */
export class Vector2 {
    #x;
    #y;

    /**
     * Creates a new Vector2.
     * @param {number} x - The x component.
     * @param {number} y - The y component.
     */
    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    /**
     * Gets the x component.
     * @returns {number} The x coordinate.
     */
    get x() {
        return this.#x;
    }

    /**
     * Gets the y component.
     * @returns {number} The x coordinate.
     */
    get y() {
        return this.#y;
    }
}
