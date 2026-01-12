import { Vector2 } from '../math/vector2.js';
import { Vector3 } from '../math/vector3.js';
import { Transform } from '../math/transform.js';

/**
 * Projects 3D scene coordinates to 2D screen coordinates.
 */
export class Camera {
    /**
     * Creates a new Camera.
     * @param {Vector2} screenSize - The canvas dimensions (width, height).
     * @param {number} fov - The vertical field of view in degrees (default 60).
     */
    constructor(screenSize, fov = 60) {
        /** @type {Vector2} */
        this.screenSize = screenSize;
        /** @type {number} */
        this.aspectRatio = screenSize.x / screenSize.y;
        /** @type {Transform} */
        this.transform = new Transform(Vector3.zero, Vector3.zero, Vector3.one);
        /** @type {boolean} @private */
        this._backFaceCulling = false;
        this.setFov(fov);
    }

    /**
     * Gets whether back-face culling is enabled.
     * @returns {boolean} True if back-face culling is enabled.
     */
    isBackFaceCulling() {
        return this._backFaceCulling;
    }

    /**
     * Toggles back-face culling on or off.
     * When enabled, faces pointing away from the camera are not rendered.
     * @param {boolean} [enabled] - If provided, sets the state directly. Otherwise flips the current state.
     */
    toggleBackFaceCulling(enabled) {
        this._backFaceCulling = enabled !== undefined ? enabled : !this._backFaceCulling;
    }

    /**
     * Sets the field of view.
     * @param {number} fov - The vertical field of view in degrees.
     */
    setFov(fov) {
        /** @type {number} */
        this.fov = fov;
        const fovRadians = (fov * Math.PI) / 180;
        /** @type {number} */
        this.focalLength = 1 / Math.tan(fovRadians / 2);
    }

    /**
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this.screenSize = newScreenSize;
        this.aspectRatio = newScreenSize.x / newScreenSize.y;
    }

    /**
     * Projects all faces of a scene object to screen coordinates.
     * @param {SceneObject} sceneObject - The scene object to project.
     * @returns {{screenPositions: Vector2[]}[]} Array of projected faces with screen positions.
     */
    projectSceneObject(sceneObject) {
        const sceneVerts = sceneObject.getSceneVertices();
        const projectedFaces = [];
        
        // Map vertices to their associated face indices
        for (const face of sceneObject.getMesh().getFaceIndices()) {
            const faceVerts = face.map(idx => sceneVerts[idx]);
            
            // Back-face culling: skip faces pointing away from camera
            if (this._backFaceCulling && faceVerts.length >= 3) {
                if (this.isBackFacing(faceVerts)) {
                    continue;
                }
            }
            
            const screenPositions = this.getScreenPositions(faceVerts);
            projectedFaces.push({ screenPositions });
        }

        return projectedFaces;
    }

    /**
     * Determines if a face is back-facing (pointing away from the camera).
     * Uses the first three vertices to compute the face normal.
     * @param {Vector3[]} faceVerts - The face vertices in world space.
     * @returns {boolean} True if the face is back-facing.
     */
    isBackFacing(faceVerts) {
        // Transform vertices to camera space
        const v0 = this.worldToCameraSpace(faceVerts[0]);
        const v1 = this.worldToCameraSpace(faceVerts[1]);
        const v2 = this.worldToCameraSpace(faceVerts[2]);
        
        // Compute face normal using cross product of two edges
        const edge1 = v1.subtract(v0);
        const edge2 = v2.subtract(v0);
        const normal = edge1.cross(edge2);
        
        // Face is back-facing if normal points away from camera (positive z in camera space)
        // We use v0 as the view vector since camera is at origin in camera space
        return normal.dot(v0) > 0;
    }

    /**
     * Converts a normalized screen position to a screen position based on the screen's/canvas's size.
     * @param {Vector2} normScreenPos - The normalized screen position of a point
     * @returns {Vector2} The screen position of the point relative to the screen's/canvas's size
     */
    getScaledScreenPosition(normScreenPos) {
        /* Currently (0, 0) is the top left corner of the canvas

        * Convert from normalized coordinates to respective screen coordinates based on the canvas size:

        * (0, 0) -> (canvas width / 2, canvas height / 2) = Center of the canvas
        * (-1, 1) -> (canvas width / 2, -(canvas height / 2)) = Top right corner of the canvas
        * (1, -1) -> (-(canvas width / 2), canvas height / 2) = Bottom left corner of the canvas
        */

        return new Vector2(
            (normScreenPos.x + 1) / 2 * this.screenSize.x, 
            (1 - (normScreenPos.y + 1) / 2) * this.screenSize.y);
    }

    /**
     * Converts a point's 3D position in the scene to a normalized screen position by dividing x and y by z individually.
     * @param {Vector3} scenePos - The 3D position of a point in the scene
     * @returns {Vector2} The normalized screen position of the point
     */
    getNormalizedScreenPosition(scenePos) {
        /* 
        * If > 0 the point is in front of the camera, if <= 0 the point is not visible, because the divisor 
        * would be zero. Thus it is in the same 3D position as the camera. As z increases the 3D point moves 
        * further away from the camera. */

        return new Vector2(
            (scenePos.x / scenePos.z) * this.focalLength / this.aspectRatio,
            (scenePos.y / scenePos.z) * this.focalLength
        );
    }

    /**
     * Transforms a world-space position to camera-space.
     * Applies inverse camera transform: translate by -position, then rotate by -rotation.
     * @param {Vector3} worldPos - The position in world/scene space.
     * @returns {Vector3} The position in camera space.
     */
    worldToCameraSpace(worldPos) {
        // First translate by negative camera position
        const translated = worldPos.getTranslated(
            this.transform.position.getScaled(-1)
        );
        
        // Then rotate by negative camera rotation (in reverse order: Z, Y, X)
        return translated
            .getRotatedZ(-this.transform.rotation.z)
            .getRotatedY(-this.transform.rotation.y)
            .getRotatedX(-this.transform.rotation.x);
    }

    /**
     * Projects a 3D position to screen pixel coordinates.
     * @param {Vector3} scenePos - The 3D position in scene/world space.
     * @returns {Vector2} The position in pixel coordinates.
     */
    getVertexScreenPos(scenePos) {
        const cameraSpacePos = this.worldToCameraSpace(scenePos);
        return this.getScaledScreenPosition(this.getNormalizedScreenPosition(cameraSpacePos));
    }

    /**
     * Projects multiple 3D positions to screen pixel coordinates.
     * @param {Vector3[]} vertices - Array of 3D positions.
     * @returns {Vector2[]} Array of screen positions in pixels.
     */
    getScreenPositions(vertices) {
        return vertices.map(v => this.getVertexScreenPos(v));
    }
}
