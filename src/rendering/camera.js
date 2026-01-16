import {Vector2} from '../math/vector2.js';
import {Vector3} from '../math/vector3.js';
import {Transform} from '../math/transform.js';
import {ProjectedFace} from './projected-face.js';

/**
 * Projects 3D scene coordinates to 2D screen coordinates.
 */
export class Camera {
    // region Fields

    #screenSize;
    #aspectRatio;
    #transform;
    #isBackFaceCulling;
    #fov;
    #focalLength;

    // endregion

    // region Constructor

    /**
     * Creates a new Camera.
     * @param {Vector2} screenSize - The canvas dimensions (width, height).
     * @param {number} fov - The vertical field of view in degrees (default 60).
     */
    constructor(screenSize, fov = 60) {
        /** @type {Vector2} */
        this.#screenSize = screenSize;
        /** @type {number} */
        this.#aspectRatio = screenSize.x / screenSize.y;
        /** @type {Transform} */
        this.#transform = new Transform(Vector3.zero(), Vector3.zero(), Vector3.one());
        /** @type {boolean} */
        this.#isBackFaceCulling = false;
        this.setFov(fov);
    }

    // endregion

    // region Getter and Setter Properties

    get transform() {
        return this.#transform;
    }

    /**
     * Gets whether back-face culling is enabled.
     * @returns {boolean} True if back-face culling is enabled.
     */
    get isBackFaceCulling() {
        return this.#isBackFaceCulling;
    }

    /**
     * Toggles back-face culling on or off.
     * When enabled, faces pointing away from the camera are not rendered.
     * @param {boolean} [enabled] - Sets state directly.
     */
    set isBackFaceCulling(enabled) {
        this.#isBackFaceCulling = enabled;
    }

    // endregion

    // region Setter Methods

    /**
     * Sets the field of view.
     * @param {number} fov - The vertical field of view in degrees.
     */
    setFov(fov) {
        /** @type {number} */
        this.#fov = fov;
        const fovRadians = (fov * Math.PI) / 180;
        /** @type {number} */
        this.#focalLength = 1 / Math.tan(fovRadians / 2);
    }

    /**
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this.#screenSize = newScreenSize;
        this.#aspectRatio = newScreenSize.x / newScreenSize.y;
    }

    // endregion

    // region Public Methods

    /**
     * Projects all faces of a scene object to screen coordinates.
     * @param {SceneObject} sceneObject - The scene object to project.
     * @returns {ProjectedFace[]} Array of projected faces with screen positions and depth.
     */
    projectSceneObject(sceneObject) {
        const worldVertices = sceneObject.getTransformedVertices();

        // Transform all vertices to camera space once (avoids duplicate transforms)
        const cameraSpaceVertices = worldVertices.map(v => this.#worldToCameraSpace(v));

        const projectedFaces = [];

        // Map vertices to their associated face indices
        for (const face of sceneObject.mesh.faceIndices) {
            const faceCameraVertices = face.map(idx => cameraSpaceVertices[idx]);

            // Back-face culling: skip faces pointing away from the camera
            if (this.#isBackFaceCulling && faceCameraVertices.length >= 3 && this.#isBackFacing(faceCameraVertices))
                continue;

            // Project vertices and calculate average depth
            let depthSum = 0;
            const screenPositions = [];
            let isValid = true;

            for (const cameraSpacePos of faceCameraVertices) {
                depthSum += cameraSpacePos.z;

                const normScreenPos = this.#getNormalizedScreenPosition(cameraSpacePos);
                if (normScreenPos === null) {
                    isValid = false;
                    break;
                }

                screenPositions.push(
                    this.#getScaledScreenPosition(normScreenPos)
                );
            }

            if (!isValid)
                continue;

            const averageDepth = depthSum / faceCameraVertices.length;
            projectedFaces.push(new ProjectedFace(
                screenPositions,
                averageDepth,
                sceneObject.material.edgeColor,
                sceneObject.material.edgeGradientColor,
                sceneObject.material.faceColor
            ));
        }

        return projectedFaces;
    }

    // endregion

    // region Helper Methods

    /**
     * Determines if a face is back-facing relative to the camera.
     * Uses the first 3 vertices to compute the face normal (assumes planar faces).
     * @param {Vector3[]} cameraSpaceVertices - Face vertices already in camera space.
     * @returns {boolean} True if the face is back-facing and should be culled.
     * @private
     */
    #isBackFacing(cameraSpaceVertices) {
        const v0 = cameraSpaceVertices[0];
        const v1 = cameraSpaceVertices[1];
        const v2 = cameraSpaceVertices[2];

        // Compute face normal using cross-product of two edges
        const edge1 = v1.getDifference(v0);
        const edge2 = v2.getDifference(v0);
        const normal = edge1.getCross(edge2);

        // In camera space, camera is at origin. The view direction from v0 to camera is -v0.
        // Front-facing: normal · (-v0) > 0, meaning normal · v0 < 0
        // Back-facing: normal · v0 > 0
        return normal.getDot(v0) > 0;
    }

    /** @private */
    #getScaledScreenPosition(normScreenPos) {
        /* Currently (0, 0) is the top left corner of the canvas

        * Convert from normalized coordinates to respective screen coordinates based on the canvas size:

        * (0, 0) -> (canvas width / 2, canvas height / 2) = Center of the canvas
        * (-1, 1) -> (canvas width / 2, -(canvas height / 2)) = Top right corner of the canvas
        * (1, -1) -> (-(canvas width / 2), canvas height / 2) = Bottom left corner of the canvas
        */

        return new Vector2(
            (normScreenPos.x + 1) / 2 * this.#screenSize.x,
            (1 - (normScreenPos.y + 1) / 2) * this.#screenSize.y);
    }

    /** @private */
    #getNormalizedScreenPosition(scenePos) {
        /*
        * If > 0 the point is in front of the camera, if <= 0 the point is not visible, because the divisor
        * would be zero. Thus, it is in the same 3D position as the camera. As z increases the 3D point moves
        * further away from the camera. */
        const near = 1e-4;
        if (scenePos.z <= near)
            return null;

        return new Vector2(
            (scenePos.x / scenePos.z) * this.#focalLength / this.#aspectRatio,
            (scenePos.y / scenePos.z) * this.#focalLength
        );
    }

    /** @private */
    #worldToCameraSpace(worldPos) {
        // First translate by negative camera position
        const translated = worldPos.getTranslated(
            this.#transform.position.getScaled(-1)
        );

        // Then rotate by negative camera rotation (in reverse order: Z, Y, X)
        return translated
            .getRotatedZ(-this.#transform.rotation.z)
            .getRotatedY(-this.#transform.rotation.y)
            .getRotatedX(-this.#transform.rotation.x);
    }

    // endregion
}
