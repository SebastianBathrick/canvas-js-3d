import {Renderer} from '../rendering/renderer.js';
import {Camera} from '../rendering/camera.js';
import {ProjectedFace} from '../rendering/projected-face.js';
import {ColorUtils} from '../rendering/color-utils.js';
import {Vector2} from '../math/vector2.js';
import {Scene} from './scene.js';

/**
 * The main engine that manages the render loop, camera, and scene.
 */
export class Engine {
    /** @type {Renderer} */
    #renderer;
    /** @type {Camera} */
    #camera;

    /**
     * Creates a new Engine.
     * @param {HTMLCanvasElement} canvas - The canvas element to render to.
     * @param {number} [fov=60] - The field of view in degrees.
     */
    constructor(canvas, fov = 60) {
        this.#renderer = new Renderer(canvas);
        this.#camera = new Camera(new Vector2(canvas.width, canvas.height), fov);
        /** @type {Scene} */
        this.scene = new Scene();
        /** @type {boolean} */
        this._depthSorting = false;
        /** @type {boolean} */
        this._running = false;
        /** @type {number|null} */
        this._lastFrameTime = null;
        /** @type {number} */
        this._fps = 0;
        /** @type {boolean} @private */
        this._showFPS = false;
        /**
         * Callback invoked each frame with delta time.
         * @type {((deltaTime: number) => void)|null}
         */
        this.onUpdate = null;
        /** @type {string} Default edge color for faces without explicit color */
        this._defaultEdgeColor = '#ffffff';
        /**
         * Depth fog configuration.
         * @type {{enabled: boolean, color: string, near: number, far: number}}
         */
        this._depthFog = {
            enabled: false,
            color: '#000000',
            near: 5,
            far: 50
        };
    }

    /**
     * Gets the camera instance.
     * @returns {Camera} The camera.
     */
    get camera() {
        return this.#camera;
    }

    /**
     * Gets whether depth sorting is enabled.
     * @returns {boolean} True if depth sorting is enabled.
     */
    isDepthSorting() {
        return this._depthSorting;
    }

    /**
     * Toggles depth sorting on or off.
     * When enabled, faces are sorted back-to-front and filled with background color
     * to create the illusion of solid objects (painter's algorithm).
     * @param {boolean} [enabled] - If provided, sets the state directly. Otherwise flips the current state.
     */
    toggleDepthSorting(enabled) {
        this._depthSorting = enabled !== undefined ? enabled : !this._depthSorting;
    }

    /**
     * Configures depth fog effect.
     * When enabled, objects fade toward the fog color based on their distance from the camera.
     * @param {{enabled?: boolean, color?: string, near?: number, far?: number}} options - Fog configuration.
     */
    setDepthFog(options) {
        if (options.enabled !== undefined)
            this._depthFog.enabled = options.enabled;

        if (options.color !== undefined)
            this._depthFog.color = options.color;

        if (options.near !== undefined)
            this._depthFog.near = options.near;

        if (options.far !== undefined)
            this._depthFog.far = options.far;
    }

    /**
     * Gets the current depth fog configuration.
     * @returns {{enabled: boolean, color: string, near: number, far: number}} The fog settings.
     */
    getDepthFog() {
        return {...this._depthFog};
    }

    /**
     * Gets the background color.
     * @returns {string} The background color.
     */
    getBackgroundColor() {
        return this.#renderer.getBackgroundColor();
    }

    /**
     * Sets the background color.
     * @param {string} color - The background color (hex string or CSS color).
     */
    setBackgroundColor(color) {
        this.#renderer.setBackgroundColor(color);
    }

    /**
     * Gets the background gradient end color.
     * @returns {string|null} The gradient end color, or null if no gradient.
     */
    getBackgroundGradientColor() {
        return this.#renderer.getBackgroundGradientColor();
    }

    /**
     * Sets the background gradient end color. Set to null to disable gradient.
     * @param {string|null} color - The gradient end color, or null to disable.
     */
    setBackgroundGradientColor(color) {
        this.#renderer.setBackgroundGradientColor(color);
    }

    /**
     * Gets the debug text color (used for FPS counter).
     * @returns {string} The debug text color.
     */
    getDebugTextColor() {
        return this.#renderer.getDebugTextColor();
    }

    /**
     * Sets the debug text color (used for FPS counter).
     * @param {string} color - The debug text color.
     */
    setDebugTextColor(color) {
        this.#renderer.setDebugTextColor(color);
    }

    /**
     * Gets the default edge color for faces without explicit color.
     * @returns {string} The default edge color.
     */
    getDefaultEdgeColor() {
        return this._defaultEdgeColor;
    }

    /**
     * Sets the default edge color for faces without explicit color.
     * @param {string} color - The default edge color.
     */
    setDefaultEdgeColor(color) {
        this._defaultEdgeColor = color;
    }

    /**
     * Enables or disables the FPS counter display.
     * @param {boolean} enabled - Whether to show the FPS counter.
     */
    toggleFPS(enabled) {
        this._showFPS = enabled;
    }

    /**
     * Configures global bloom effect.
     * When enabled, edges glow with a soft blur effect.
     * @param {{enabled?: boolean, blur?: number, color?: string|null}} options - Bloom settings.
     *   - enabled: Whether bloom is active (default false)
     *   - blur: Blur radius in pixels (default 15)
     *   - color: Glow color, or null to use edge color (default null)
     */
    setBloom(options) {
        this.#renderer.setBloom(options);
    }

    /**
     * Gets the current bloom configuration.
     * @returns {{enabled: boolean, blur: number, color: string|null}} Bloom settings.
     */
    getBloom() {
        return this.#renderer.getBloom();
    }

    /**
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this.#renderer.setScreenSize(newScreenSize);
        this.#camera.setScreenSize(newScreenSize);
    }

    /** @private */
    _frameUpdate() {
        if (!this._running)
            return;

        const now = performance.now();
        const deltaTime = this._lastFrameTime ? (now - this._lastFrameTime) / 1000 : 0;
        this._lastFrameTime = now;
        this._fps = deltaTime > 0 ? 1 / deltaTime : 0;

        if (this.onUpdate)
            this.onUpdate(deltaTime);

        this.#renderer.clear();
        this._renderAllObjects();

        if (this._showFPS) {
            this.#renderer.renderFPS(this._fps);
        }

        requestAnimationFrame(() => this._frameUpdate());
    }

    /** @private */
    _renderAllObjects() {
        // Collect all projected faces from all objects
        const allFaces = [];

        for (const obj of this.scene.getSceneObjects()) {
            const projectedFaces = this.#camera.projectSceneObject(obj);
            allFaces.push(...projectedFaces);
        }

        // Sort if depth sorting is enabled (back-to-front)
        if (this._depthSorting) {
            allFaces.sort(ProjectedFace.compareByDepth);
        }

        // Clear bloom canvas at start of frame
        const bloomEnabled = this.#renderer.isBloomEnabled();
        if (bloomEnabled) {
            this.#renderer.clearBloomCanvas();
        }

        // Render each face
        for (const face of allFaces) {
            const positions = face.screenPositions;

            // Determine edge color(s)
            let edgeColor = face.color || this._defaultEdgeColor;
            let gradientEndColor = face.gradientColor;
            let fillColor = face.faceColor;

            // Apply depth fog if enabled
            if (this._depthFog.enabled) {
                const fogAmount = ColorUtils.calculateFogAmount(
                    face.depth,
                    this._depthFog.near,
                    this._depthFog.far
                );
                edgeColor = ColorUtils.applyFog(edgeColor, this._depthFog.color, fogAmount);
                if (gradientEndColor) {
                    gradientEndColor = ColorUtils.applyFog(gradientEndColor, this._depthFog.color, fogAmount);
                }
                if (fillColor) {
                    fillColor = ColorUtils.applyFog(fillColor, this._depthFog.color, fogAmount);
                }
            }

            // Fill face to occlude faces behind (depth sorting) or render face color
            if (this._depthSorting) {
                this.#renderer.fillFace(positions, fillColor || this.#renderer.getBackgroundColor());
            }

            // Draw edges to main canvas
            for (let i = 0; i < positions.length; i++) {
                const startPos = positions[i];
                const endPos = positions[(i + 1) % positions.length];

                if (gradientEndColor) {
                    this.#renderer.renderEdgeGradient(startPos, endPos, edgeColor, gradientEndColor);
                } else {
                    this.#renderer.renderEdgeWithColor(startPos, endPos, edgeColor);
                }

                // Also draw to bloom canvas if enabled
                if (bloomEnabled) {
                    if (gradientEndColor) {
                        this.#renderer.renderEdgeGradientToBloom(startPos, endPos, edgeColor, gradientEndColor);
                    } else {
                        this.#renderer.renderEdgeToBloom(startPos, endPos, edgeColor);
                    }
                }
            }
        }

        // Composite bloom at end of frame
        if (bloomEnabled) {
            this.#renderer.compositeBloom();
        }
    }

    /**
     * Starts the render loop.
     */
    start() {
        this._running = true;
        this._frameUpdate();
    }

    /**
     * Stops the render loop.
     */
    stop() {
        this._running = false;
    }
}
