/**
 * A 3D vector class for positions and directions in 3D space.
 * Methods return new instances (immutable style).
 */
export class Vector3 {
    /**
     * Creates a new Vector3.
     * @param {number} x - The x component.
     * @param {number} y - The y component.
     * @param {number} z - The z component.
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * The zero vector (0, 0, 0).
     * @type {Vector3}
     */
    static zero = Object.freeze(new Vector3(0, 0, 0));

    /**
     * The one vector (1, 1, 1).
     * @type {Vector3}
     */
    static one = Object.freeze(new Vector3(1, 1, 1));

    /**
     * The left direction (-1, 0, 0).
     * @type {Vector3}
     */
    static left = Object.freeze(new Vector3(-1, 0, 0));

    /**
     * The right direction (1, 0, 0).
     * @type {Vector3}
     */
    static right = Object.freeze(new Vector3(1, 0, 0));

    /**
     * The up direction (0, 1, 0).
     * @type {Vector3}
     */
    static up = Object.freeze(new Vector3(0, 1, 0));

    /**
     * The down direction (0, -1, 0).
     * @type {Vector3}
     */
    static down = Object.freeze(new Vector3(0, -1, 0));

    /**
     * Returns a new vector translated by the given direction.
     * @param {Vector3} dir - The direction to translate by.
     * @returns {Vector3} A new translated vector.
     */
    getTranslated(dir) {
        return new Vector3(this.x + dir.x, this.y + dir.y, this.z + dir.z);
    }

    /**
     * Returns a new vector rotated around the Y axis (XZ plane rotation).
     * @param {number} angle - The rotation angle in radians.
     * @returns {Vector3} A new rotated vector.
     */
    getRotatedY(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        return new Vector3(
            this.x * cos - this.z * sin,
            this.y,
            this.x * sin + this.z * cos
        );
    }

    /**
     * Returns a new vector scaled by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     * @returns {Vector3} A new scaled vector.
     */
    getScaled(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    /**
     * Checks if all components are zero.
     * @returns {boolean} True if the vector is zero.
     */
    isZero() {
        return this.x === 0 && this.y === 0 && this.z === 0;
    }

    /**
     * Gets a unit vector pointing in the same direction.
     * @returns {Vector3} A new normalized vector, or zero vector if magnitude is 0.
     */
    getNormalized() {
        const mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

        if (mag === 0) return Vector3.zero;

        return new Vector3(this.x / mag, this.y / mag, this.z / mag);
    }

    /**
     * Gets the length of the vector.
     * @returns {number} The magnitude.
     */
    getMagnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}
