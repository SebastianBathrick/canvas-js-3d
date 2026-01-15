/**
 * A 3D vector class for positions and directions in 3D space.
 * Completely immutable - all methods return new instances.
 */
export class Vector3 {
    // region Fields

    #x;
    #y;
    #z;

    // endregion

    // region Constructor

    /**
     * Creates a new Vector3.
     * @param {number} x - The x component.
     * @param {number} y - The y component.
     * @param {number} z - The z component.
     */
    constructor(x, y, z) {
        /** @type {number} @private */
        this.#x = x;
        /** @type {number} @private */
        this.#y = y;
        /** @type {number} @private */
        this.#z = z;
    }

    // endregion

    // region Getter Properties

    /**
     * Gets the x component.
     * @returns {number} The x coordinate.
     */
    get x() {
        return this.#x;
    }

    /**
     * Gets the y component.
     * @returns {number} The y component.
     */
    get y() {
        return this.#y;
    }

    /**
     * Gets the z component.
     * @returns {number} The z component.
     */
    get z() {
        return this.#z;
    }

    // endregion

    // region Vector3 Operation Methods

    /**
     * Returns a new vector translated by the given direction.
     * @param {Vector3} dir - The direction to translate by.
     * @returns {Vector3} A new translated vector.
     */
    getTranslated(dir) {
        return new Vector3(this.#x + dir.#x, this.#y + dir.#y, this.#z + dir.#z);
    }

    /**
     * Returns a new vector rotated around all axes (XYZ rotation).
     * @param {Vector3} rotation - The rotation angles in radians (x, y, z).
     * @returns {Vector3} A new rotated vector.
     */
    getRotated(rotation)
    {
        return this.getRotatedX(rotation.x)
            .getRotatedY(rotation.y)
            .getRotatedZ(rotation.z);
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
            this.x,
            this.y * cos - this.z * sin,
            this.y * sin + this.z * cos
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
            this.x * cos - this.z * sin,
            this.y,
            this.x * sin + this.z * cos
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
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos,
            this.z
        );
    }

    /**
     * Returns a new vector scaled by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     * @returns {Vector3} A new scaled vector.
     */
    getScaled(scalar) {
        return new Vector3(this.#x * scalar, this.#y * scalar, this.#z * scalar);
    }

    /**
     * Returns a new vector with component-wise scaling.
     * @param {Vector3} scale - The scale factors for each axis.
     * @returns {Vector3} A new scaled vector.
     */
    getScaledByVector(scale) {
        return new Vector3(this.#x * scale.x, this.#y * scale.y, this.#z * scale.z);
    }



    /**
     * Gets a unit vector pointing in the same direction.
     * @returns {Vector3} A new normalized vector, or zero vector if magnitude is 0.
     */
    getNormalized() {
        const mag = Math.sqrt(this.#x * this.#x + this.#y * this.#y + this.#z * this.#z);

        if (mag === 0) return Vector3.zero();

        return new Vector3(this.#x / mag, this.#y / mag, this.#z / mag);
    }

    /**
     * Gets the length of the vector.
     * @returns {number} The magnitude.
     */
    getMagnitude() {
        return Math.sqrt(this.#x * this.#x + this.#y * this.#y + this.#z * this.#z);
    }

    /**
     * Computes the dot product with another vector.
     * @param {Vector3} other - The other vector.
     * @returns {number} The dot product.
     */
    getDot(other) {
        return this.#x * other.#x + this.#y * other.#y + this.#z * other.#z;
    }

    /**
     * Computes the cross-product with another vector.
     * @param {Vector3} other - The other vector.
     * @returns {Vector3} A new vector perpendicular to both inputs.
     */
    getCross(other) {
        return new Vector3(
            this.#y * other.#z - this.#z * other.#y,
            this.#z * other.#x - this.#x * other.#z,
            this.#x * other.#y - this.#y * other.#x
        );
    }

    /**
     * Returns a new vector representing the difference (this - other).
     * @param {Vector3} other - The vector to subtract.
     * @returns {Vector3} A new vector.
     */
    getDifference(other) {
        return new Vector3(this.#x - other.#x, this.#y - other.#y, this.#z - other.#z);
    }

    // endregion

    // region Utility Methods

    /**
     * Checks if all components are zero.
     * @returns {boolean} True if the vector is zero.
     */
    isZero() {
        return this.#x === 0 && this.#y === 0 && this.#z === 0;
    }

    // endregion

    // region Static Directional Vectors

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
     * Returns a new left-direction vector (-1, 0, 0).
     * @returns {Vector3} A new left direction vector.
     */
    static left() {
        return new Vector3(-1, 0, 0);
    }

    /**
     * Returns a new right-direction vector (1, 0, 0).
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

    // endregion
}
