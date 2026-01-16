import {Vector3} from './vector3.js';

/**
 * Represents the position, rotation, and scale of an object in 3D space.
 */
export class Transform {
    // region Fields

    #position;
    #rotation;
    #scale;

    // endregion

    // region Constructor

    /**
     * Creates a new Transform.
     * @param {Vector3} position - The position in 3D space.
     * @param {Vector3} rotation - The rotation angles in radians (x, y, z).
     * @param {Vector3} scale - The scale factors for each axis.
     */
    constructor(position, rotation, scale) {
        this.#position = position;
        this.#rotation = rotation;
        this.#scale = scale;
    }

    // endregion

    // region Getter Properties

    /**
     * Gets the position.
     * @returns {Vector3} The position in 3D space.
     */
    get position() {
        // Note that Vector3 objects are immutable, so sending a direct reference here is safe.
        return this.#position;
    }

    /**
     * Gets the rotation.
     * @returns {Vector3} The rotation angles in radians.
     */
    get rotation() {
        return this.#rotation;
    }

    /**
     * Gets the scale.
     * @returns {Vector3} The scale factors for each axis.
     */
    get scale() {
        return this.#scale;
    }

    // endregion

    // region Setter Properties
    /**
     * Sets the position.
     * @param position - The new position Vector3.
     */
    set position(position) {
       this.#position = position;
    }

    /**
     * Sets the rotation.
     * @param rotation - The new rotation Vector3.
     */
    set rotation(rotation) {
        this.#rotation = rotation;
    }

    /**
     * Sets the scale.
     * @param scale - The new scale Vector3.
     */
    set scale(scale) {
        this.#scale = scale;
    }
    // endregion

    // region Setter Utility Methods

    /**
     * Sets the position.
     * @param {Vector3|number} valueOrX - The new position Vector3, or the x component.
     * @param {number} [y] - The y component (if x was provided as first parameter).
     * @param {number} [z] - The z component (if x was provided as first parameter).
     */
    setPosition(valueOrX, y, z) {
        if (valueOrX instanceof Vector3) {
            this.#position = valueOrX;
        } else {
            this.#position = new Vector3(valueOrX, y, z);
        }
    }

    /**
     * Sets the rotation.
     * @param {Vector3|number} valueOrX - The new rotation Vector3, or the x component in radians.
     * @param {number} [y] - The y component in radians (if x was provided as first parameter).
     * @param {number} [z] - The z component in radians (if x was provided as first parameter).
     */
    setRotation(valueOrX, y, z) {
        if (valueOrX instanceof Vector3) {
            this.#rotation = valueOrX;
        } else {
            this.#rotation = new Vector3(valueOrX, y, z);
        }
    }

    /**
     * Sets the scale.
     * @param {Vector3|number} valueOrX - The new scale Vector3, or the x component.
     * @param {number} [y] - The y component (if x was provided as first parameter).
     * @param {number} [z] - The z component (if x was provided as first parameter).
     */
    setScale(valueOrX, y, z) {
        if (valueOrX instanceof Vector3) {
            this.#scale = valueOrX;
        } else {
            this.#scale = new Vector3(valueOrX, y, z);
        }
    }

    // endregion

    // region Transform Operation Methods

    /**
     * Translates the position by the given vector.
     * @param {Vector3} movement - The translation to apply.
     */
    move(movement) {
        this.#position = this.#position.getTranslated(movement);
    }

    /**
     * Rotates by adding the given rotation angles to the current rotation.
     * @param {Vector3} rotation - The rotation angles in radians (x, y, z) to add.
     */
    rotate(rotation) {
        this.#rotation = this.#rotation.getTranslated(rotation);
    }

    /**
     * Multiplies all scale components by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleBy(scalar) {
        this.#scale = this.#scale.getScaled(scalar);
    }

    // endregion
}
