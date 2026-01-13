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
        this.position = position;
        this.rotation = rotation;
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
     * Rotates around the X axis by the given angle.
     * @param {number} angle - The angle to rotate by in radians.
     */
    rotateX(angle) {
        this.rotation = this.rotation.getTranslated(new Vector3(angle, 0, 0));
    }

    /**
     * Rotates around the Y axis by the given angle.
     * @param {number} angle - The angle to rotate by in radians.
     */
    rotateY(angle) {
        this.rotation = this.rotation.getTranslated(new Vector3(0, angle, 0));
    }

    /**
     * Rotates around the Z axis by the given angle.
     * @param {number} angle - The angle to rotate by in radians.
     */
    rotateZ(angle) {
        this.rotation = this.rotation.getTranslated(new Vector3(0, 0, angle));
    }

    /**
     * Multiplies all scale components by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleBy(scalar) {
        this.scale = this.scale.getScaled(scalar);
    }

    /**
     * Multiplies the X scale component by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleX(scalar) {
        this.scale = new Vector3(this.scale.x * scalar, this.scale.y, this.scale.z);
    }

    /**
     * Multiplies the Y scale component by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleY(scalar) {
        this.scale = new Vector3(this.scale.x, this.scale.y * scalar, this.scale.z);
    }

    /**
     * Multiplies the Z scale component by a scalar value.
     * @param {number} scalar - The scalar to multiply by.
     */
    scaleZ(scalar) {
        this.scale = new Vector3(this.scale.x, this.scale.y, this.scale.z * scalar);
    }
}
