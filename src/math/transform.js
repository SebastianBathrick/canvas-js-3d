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
     * @param {Vector3|number} valueOrX - The new position Vector3, or the x component.
     * @param {number} [y] - The y component (if x was provided as first parameter).
     * @param {number} [z] - The z component (if x was provided as first parameter).
     */
    setPosition(valueOrX, y, z) {
        if (valueOrX instanceof Vector3) {
            this._position = valueOrX;
        } else {
            this._position = new Vector3(valueOrX, y, z);
        }
    }

    /**
     * Sets the x component of position.
     * @param {number} x - The new x position.
     */
    setPositionX(x) {
        this._position = new Vector3(x, this._position.y, this._position.z);
    }

    /**
     * Sets the y component of position.
     * @param {number} y - The new y position.
     */
    setPositionY(y) {
        this._position = new Vector3(this._position.x, y, this._position.z);
    }

    /**
     * Sets the z component of position.
     * @param {number} z - The new z position.
     */
    setPositionZ(z) {
        this._position = new Vector3(this._position.x, this._position.y, z);
    }

    /**
     * Sets the rotation.
     * @param {Vector3|number} valueOrX - The new rotation Vector3, or the x component in radians.
     * @param {number} [y] - The y component in radians (if x was provided as first parameter).
     * @param {number} [z] - The z component in radians (if x was provided as first parameter).
     */
    setRotation(valueOrX, y, z) {
        if (valueOrX instanceof Vector3) {
            this._rotation = valueOrX;
        } else {
            this._rotation = new Vector3(valueOrX, y, z);
        }
    }

    /**
     * Sets the x component of rotation.
     * @param {number} x - The new x rotation in radians.
     */
    setRotationX(x) {
        this._rotation = new Vector3(x, this._rotation.y, this._rotation.z);
    }

    /**
     * Sets the y component of rotation.
     * @param {number} y - The new y rotation in radians.
     */
    setRotationY(y) {
        this._rotation = new Vector3(this._rotation.x, y, this._rotation.z);
    }

    /**
     * Sets the z component of rotation.
     * @param {number} z - The new z rotation in radians.
     */
    setRotationZ(z) {
        this._rotation = new Vector3(this._rotation.x, this._rotation.y, z);
    }

    /**
     * Sets the scale.
     * @param {Vector3|number} valueOrX - The new scale Vector3, or the x component.
     * @param {number} [y] - The y component (if x was provided as first parameter).
     * @param {number} [z] - The z component (if x was provided as first parameter).
     */
    setScale(valueOrX, y, z) {
        if (valueOrX instanceof Vector3) {
            this._scale = valueOrX;
        } else {
            this._scale = new Vector3(valueOrX, y, z);
        }
    }

    /**
     * Sets the x component of scale.
     * @param {number} x - The new x scale.
     */
    setScaleX(x) {
        this._scale = new Vector3(x, this._scale.y, this._scale.z);
    }

    /**
     * Sets the y component of scale.
     * @param {number} y - The new y scale.
     */
    setScaleY(y) {
        this._scale = new Vector3(this._scale.x, y, this._scale.z);
    }

    /**
     * Sets the z component of scale.
     * @param {number} z - The new z scale.
     */
    setScaleZ(z) {
        this._scale = new Vector3(this._scale.x, this._scale.y, z);
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
