/**
 * Represents the position, rotation, and scale of an object in 3D space.
 */
export class Transform {
    /**
     * Creates a new Transform.
     * @param {Vector3} position - The position in 3D space.
     * @param {number} rotation - The rotation angle in radians (XZ plane only).
     * @param {number} scale - The uniform scale factor.
     */
    constructor(position, rotation, scale) {
        /** @type {Vector3} */
        this.position = position;
        /** @type {number} */
        this.rotation = rotation;
        /** @type {number} */
        this.scale = scale;
    }

    /**
     * Translates the position by the given vector.
     * @param {Vector3} translation - The translation to apply.
     */
    translate(translation) {
        this.position = this.position.getTranslated(translation);
    }

    /**
     * Rotates around the Y axis by the given angle.
     * @param {number} angle - The angle to rotate by in radians.
     */
    rotateXZ(angle) {
        this.rotation += angle;
    }

    /**
     * Multiplies the scale by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleBy(scalar) {
        this.scale *= scalar;
    }
}
