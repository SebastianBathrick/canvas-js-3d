import { Vector3 } from './vector3.js';

/**
 * Represents the position, rotation, and scale of an object in 3D space.
 */
export class Transform {
    /**
     * Creates a new Transform.
     * @param {Vector3} position - The position in 3D space.
     * @param {Vector3} rotation - The rotation angles in radians (x, y, z).
     * @param {Vector3} scale - The scale factors for each axis.
     */
    constructor(position, rotation, scale) {
        /** @type {Vector3} @private */
        this._position = position;
        /** @type {Vector3} @private */
        this._rotation = rotation;
        /** @type {Vector3} @private */
        this._scale = scale;
    }

    /**
     * Gets the position.
     * @returns {Vector3} The position in 3D space.
     */
    get position() {
        return this._position;
    }

    /**
     * Gets the rotation.
     * @returns {Vector3} The rotation angles in radians.
     */
    get rotation() {
        return this._rotation;
    }

    /**
     * Gets the scale.
     * @returns {Vector3} The scale factors for each axis.
     */
    get scale() {
        return this._scale;
    }

    /**
     * Sets the position.
     * @param {Vector3} value - The new position in 3D space.
     */
    setPosition(value) {
        this._position = value;
    }

    /**
     * Sets the rotation.
     * @param {Vector3} value - The new rotation angles in radians.
     */
    setRotation(value) {
        this._rotation = value;
    }

    /**
     * Sets the scale.
     * @param {Vector3} value - The new scale factors for each axis.
     */
    setScale(value) {
        this._scale = value;
    }

    /**
     * Translates the position by the given vector.
     * @param {Vector3} movement - The translation to apply.
     */
    move(movement) {
        this._position = this._position.getTranslated(movement);
    }

    /**
     * Rotates around the X axis by the given angle.
     * @param {number} angle - The angle to rotate by in radians.
     */
    rotateX(angle) {
        this._rotation = this._rotation.getTranslated(new Vector3(angle, 0, 0));
    }

    /**
     * Rotates around the Y axis by the given angle.
     * @param {number} angle - The angle to rotate by in radians.
     */
    rotateY(angle) {
        this._rotation = this._rotation.getTranslated(new Vector3(0, angle, 0));
    }

    /**
     * Rotates around the Z axis by the given angle.
     * @param {number} angle - The angle to rotate by in radians.
     */
    rotateZ(angle) {
        this._rotation = this._rotation.getTranslated(new Vector3(0, 0, angle));
    }

    /**
     * Multiplies all scale components by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleBy(scalar) {
        this._scale = this._scale.getScaled(scalar);
    }

    /**
     * Multiplies the X scale component by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleX(scalar) {
        this._scale = new Vector3(this._scale.x * scalar, this._scale.y, this._scale.z);
    }

    /**
     * Multiplies the Y scale component by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleY(scalar) {
        this._scale = new Vector3(this._scale.x, this._scale.y * scalar, this._scale.z);
    }

    /**
     * Multiplies the Z scale component by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleZ(scalar) {
        this._scale = new Vector3(this._scale.x, this._scale.y, this._scale.z * scalar);
    }
}
