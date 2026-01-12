import { Renderer } from '../rendering/renderer.js';
import { Camera } from '../rendering/camera.js';
import { Vector2 } from '../math/vector2.js';

/**
 * The main engine that manages the render loop, camera, and scene objects.
 */
export class Engine {
    /**
     * Creates a new Engine.
     * @param {HTMLCanvasElement} canvas - The canvas element to render to.
     * @param {string} fgColor - The foreground/wireframe color.
     * @param {string} bgColor - The background/clear color.
     */
    constructor(canvas, fgColor, bgColor, fov = 60) {
        /** @type {Renderer} */
        this.renderer = new Renderer(canvas, fgColor, bgColor);
        /** @type {Camera} */
        this.camera = new Camera(new Vector2(canvas.width, canvas.height), fov);
        /** @type {SceneObject[]} */
        this.sceneObjects = [];
        /** @type {boolean} */
        this.running = false;
        /** @type {number|null} */
        this.lastFrameTime = null;
        /**
         * Callback invoked each frame with delta time.
         * @type {((deltaTime: number) => void)|null}
         */
        this.onUpdate = null;
    }

    /**
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this.renderer.setScreenSize(newScreenSize);
        this.camera.setScreenSize(newScreenSize);
    }

    /**
     * Internal frame update loop. Calculates delta time, calls onUpdate, and renders.
     * @private
     */
    frameUpdate() {
        if (!this.running)
            return;

        const now = performance.now();
        const deltaTime = this.lastFrameTime ? (now - this.lastFrameTime) / 1000 : 0;
        this.lastFrameTime = now;

        if (this.onUpdate)
            this.onUpdate(deltaTime);

        this.renderer.clear();
        this.renderAllObjects();

        requestAnimationFrame(() => this.frameUpdate());
    }

    /**
     * Renders all scene objects as wireframes.
     * @private
     */
    renderAllObjects() {
        for (const obj of this.sceneObjects) {
            const projectedFaces = this.camera.projectSceneObject(obj);

            for (const face of projectedFaces) {
                const positions = face.screenPositions;

                for (let i = 0; i < positions.length; i++) {
                    this.renderer.renderEdge(
                        positions[i],
                        positions[(i + 1) % positions.length]
                    );
                }
            }
        }
    }

    /**
     * Adds a scene object to be rendered.
     * @param {SceneObject} sceneObject - The object to add.
     */
    addSceneObject(sceneObject) {
        this.sceneObjects.push(sceneObject);
    }

    /**
     * Removes a scene object from rendering.
     * @param {SceneObject} sceneObject - The object to remove.
     */
    removeSceneObject(sceneObject) {
        const idx = this.sceneObjects.indexOf(sceneObject);

        if (idx !== -1)
            this.sceneObjects.splice(idx, 1);
    }

    /**
     * Starts the render loop.
     */
    start() {
        this.running = true;
        this.frameUpdate();
    }

    /**
     * Stops the render loop.
     */
    stop() {
        this.running = false;
    }
}
