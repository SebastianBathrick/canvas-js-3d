import { Vector2 } from '../math/vector2.js';

/**
 * Projects 3D scene coordinates to 2D screen coordinates.
 */
export class Camera {
    /**
     * Creates a new Camera.
     * @param {Vector2} screenSize - The canvas dimensions (width, height).
     */
    constructor(screenSize) {
        /** @type {Vector2} */
        this.screenSize = screenSize;
    }

    /**
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this.screenSize = newScreenSize;
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
            const screenPositions = this.getScreenPositions(faceVerts);
            
            projectedFaces.push({ screenPositions });
        }

        return projectedFaces;
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

        // Calculate aspect ratio to divide the x screen coordinate by so the image is not stretched or squished
        const aspectRatio = this.screenSize.x / this.screenSize.y;

        return new Vector2(
            scenePos.x / scenePos.z / aspectRatio,
            scenePos.y / scenePos.z
        );
    }

    /**
     * Projects a 3D position to screen pixel coordinates.
     * @param {Vector3} scenePos - The 3D position in scene/world space.
     * @returns {Vector2} The position in pixel coordinates.
     */
    getVertexScreenPos(scenePos) {
        return this.getScaledScreenPosition(this.getNormalizedScreenPosition(scenePos));
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
