/**
 * A 3D vector class for positions and directions in 3D space.
 * Completely immutable - all methods return new instances.
 */
export class Vector3 {
    /**
     * Creates a new Vector3.
     * @param {number} x - The x component.
     * @param {number} y - The y component.
     * @param {number} z - The z component.
     */
    constructor(x, y, z) {
        /** @type {number} @private */
        this._x = x;
        /** @type {number} @private */
        this._y = y;
        /** @type {number} @private */
        this._z = z;
    }

    /**
     * Gets the x component.
     * @returns {number} The x component.
     */
    get x() {
        return this._x;
    }

    /**
     * Gets the y component.
     * @returns {number} The y component.
     */
    get y() {
        return this._y;
    }

    /**
     * Gets the z component.
     * @returns {number} The z component.
     */
    get z() {
        return this._z;
    }

    /**
     * Returns a new zero vector (0, 0, 0).
     * @returns {Vector3} A new zero vector.
     */
    static zero() {
        return new Vector3(0, 0, 0);
    }

    /**
     * Returns a new one vector (1, 1, 1).
     * @returns {Vector3} A new one vector.
     */
    static one() {
        return new Vector3(1, 1, 1);
    }

    /**
     * Returns a new left direction vector (-1, 0, 0).
     * @returns {Vector3} A new left direction vector.
     */
    static left() {
        return new Vector3(-1, 0, 0);
    }

    /**
     * Returns a new right direction vector (1, 0, 0).
     * @returns {Vector3} A new right direction vector.
     */
    static right() {
        return new Vector3(1, 0, 0);
    }

    /**
     * Returns a new up direction vector (0, 1, 0).
     * @returns {Vector3} A new up direction vector.
     */
    static up() {
        return new Vector3(0, 1, 0);
    }

    /**
     * Returns a new down direction vector (0, -1, 0).
     * @returns {Vector3} A new down direction vector.
     */
    static down() {
        return new Vector3(0, -1, 0);
    }

    /**
     * Returns a new vector translated by the given direction.
     * @param {Vector3} dir - The direction to translate by.
     * @returns {Vector3} A new translated vector.
     */
    getTranslated(dir) {
        return new Vector3(this._x + dir._x, this._y + dir._y, this._z + dir._z);
    }

    /**
     * Returns a new vector rotated around the X axis (YZ plane rotation).
     * @param {number} angle - The rotation angle in radians.
     * @returns {Vector3} A new rotated vector.
     */
    getRotatedX(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        return new Vector3(
            this._x,
            this._y * cos - this._z * sin,
            this._y * sin + this._z * cos
        );
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
            this._x * cos - this._z * sin,
            this._y,
            this._x * sin + this._z * cos
        );
    }

    /**
     * Returns a new vector rotated around the Z axis (XY plane rotation).
     * @param {number} angle - The rotation angle in radians.
     * @returns {Vector3} A new rotated vector.
     */
    getRotatedZ(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        return new Vector3(
            this._x * cos - this._y * sin,
            this._x * sin + this._y * cos,
            this._z
        );
    }

    /**
     * Returns a new vector scaled by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     * @returns {Vector3} A new scaled vector.
     */
    getScaled(scalar) {
        return new Vector3(this._x * scalar, this._y * scalar, this._z * scalar);
    }

    /**
     * Returns a new vector with component-wise scaling.
     * @param {Vector3} scale - The scale factors for each axis.
     * @returns {Vector3} A new scaled vector.
     */
    getScaledByVector(scale) {
        return new Vector3(this._x * scale._x, this._y * scale._y, this._z * scale._z);
    }

    /**
     * Checks if all components are zero.
     * @returns {boolean} True if the vector is zero.
     */
    isZero() {
        return this._x === 0 && this._y === 0 && this._z === 0;
    }

    /**
     * Gets a unit vector pointing in the same direction.
     * @returns {Vector3} A new normalized vector, or zero vector if magnitude is 0.
     */
    getNormalized() {
        const mag = Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);

        if (mag === 0) return Vector3.zero();

        return new Vector3(this._x / mag, this._y / mag, this._z / mag);
    }

    /**
     * Gets the length of the vector.
     * @returns {number} The magnitude.
     */
    getMagnitude() {
        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
    }

    /**
     * Computes the dot product with another vector.
     * @param {Vector3} other - The other vector.
     * @returns {number} The dot product.
     */
    getDot(other) {
        return this._x * other._x + this._y * other._y + this._z * other._z;
    }

    /**
     * Computes the cross product with another vector.
     * @param {Vector3} other - The other vector.
     * @returns {Vector3} A new vector perpendicular to both inputs.
     */
    getCross(other) {
        return new Vector3(
            this._y * other._z - this._z * other._y,
            this._z * other._x - this._x * other._z,
            this._x * other._y - this._y * other._x
        );
    }

    /**
     * Returns a new vector representing the difference (this - other).
     * @param {Vector3} other - The vector to subtract.
     * @returns {Vector3} A new vector.
     */
    getDifference(other) {
        return new Vector3(this._x - other._x, this._y - other._y, this._z - other._z);
    }
}
