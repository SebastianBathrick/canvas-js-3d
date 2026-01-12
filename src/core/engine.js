import { Renderer } from '../rendering/renderer.js';
import { Camera } from '../rendering/camera.js';
import { Vector2 } from '../math/vector2.js';
import { Scene } from './scene.js';

/**
 * The main engine that manages the render loop, camera, and scene.
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
        /** @type {Scene} */
        this.scene = new Scene();
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
        for (const obj of this.scene.getSceneObjects()) {
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
