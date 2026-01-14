import { Vector2 } from '../math/vector2.js';
import { Vector3 } from '../math/vector3.js';
import { Transform } from '../math/transform.js';
import { ProjectedFace } from './projected-face.js';

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
        this._screenSize = screenSize;
        /** @type {number} */
        this._aspectRatio = screenSize.x / screenSize.y;
        /** @type {Transform} */
        this.transform = new Transform(Vector3.zero(), Vector3.zero(), Vector3.one());
        /** @type {boolean} */
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
        this._fov = fov;
        const fovRadians = (fov * Math.PI) / 180;
        /** @type {number} */
        this._focalLength = 1 / Math.tan(fovRadians / 2);
    }

    /**
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this._screenSize = newScreenSize;
        this._aspectRatio = newScreenSize.x / newScreenSize.y;
    }

    /**
     * Projects all faces of a scene object to screen coordinates.
     * @param {SceneObject} sceneObject - The scene object to project.
     * @returns {ProjectedFace[]} Array of projected faces with screen positions and depth.
     */
    projectSceneObject(sceneObject) {
        const sceneVerts = sceneObject.getSceneVertices();
        const projectedFaces = [];
        
        // Map vertices to their associated face indices
        for (const face of sceneObject.mesh.getFaceIndices()) {
            const faceVerts = face.map(idx => sceneVerts[idx]);
            
            // Back-face culling: skip faces pointing away from camera
            if (this._backFaceCulling && faceVerts.length >= 3) {
                if (this._isBackFacing(faceVerts)) {
                    continue;
                }
            }
            
            // Project vertices and calculate average depth
            let depthSum = 0;
            const screenPositions = [];
            let isValid = true;
            
            for (const vert of faceVerts) {
                const cameraSpacePos = this._worldToCameraSpace(vert);
                depthSum += cameraSpacePos.z;

                const normScreenPos = this._getNormalizedScreenPosition(cameraSpacePos);
                if (normScreenPos === null) 
                {
                    isValid = false;
                    break;
                }

                screenPositions.push(
                    this._getScaledScreenPosition(normScreenPos)
                );
            }

            if (!isValid)
                continue;
            
            const averageDepth = depthSum / faceVerts.length;
            projectedFaces.push(new ProjectedFace(
                screenPositions,
                averageDepth,
                sceneObject.color,
                sceneObject.gradientColor,
                sceneObject.faceColor
            ));
        }

        return projectedFaces;
    }

    /** @private */
    _isBackFacing(faceVerts) {
        // Transform vertices to camera space
        const v0 = this._worldToCameraSpace(faceVerts[0]);
        const v1 = this._worldToCameraSpace(faceVerts[1]);
        const v2 = this._worldToCameraSpace(faceVerts[2]);
        
        // Compute face normal using cross product of two edges
        const edge1 = v1.getDifference(v0);
        const edge2 = v2.getDifference(v0);
        const normal = edge1.getCross(edge2);
        
        // Face is back-facing if normal points away from camera (positive z in camera space)
        // We use v0 as the view vector since camera is at origin in camera space
        return normal.getDot(v0) > 0;
    }

    /** @private */
    _getScaledScreenPosition(normScreenPos) {
        /* Currently (0, 0) is the top left corner of the canvas

        * Convert from normalized coordinates to respective screen coordinates based on the canvas size:

        * (0, 0) -> (canvas width / 2, canvas height / 2) = Center of the canvas
        * (-1, 1) -> (canvas width / 2, -(canvas height / 2)) = Top right corner of the canvas
        * (1, -1) -> (-(canvas width / 2), canvas height / 2) = Bottom left corner of the canvas
        */

        return new Vector2(
            (normScreenPos.x + 1) / 2 * this._screenSize.x, 
            (1 - (normScreenPos.y + 1) / 2) * this._screenSize.y);
    }

    /** @private */
    _getNormalizedScreenPosition(scenePos) {
        /* 
        * If > 0 the point is in front of the camera, if <= 0 the point is not visible, because the divisor 
        * would be zero. Thus it is in the same 3D position as the camera. As z increases the 3D point moves 
        * further away from the camera. */
        const near = 1e-4;
        if (scenePos.z <= near) 
            return null;

        return new Vector2(
            (scenePos.x / scenePos.z) * this._focalLength / this._aspectRatio,
            (scenePos.y / scenePos.z) * this._focalLength
        );
    }

    /** @private */
    _worldToCameraSpace(worldPos) {
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
}
