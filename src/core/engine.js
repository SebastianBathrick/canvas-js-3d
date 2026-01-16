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
    // region Fields

    #renderer;
    #camera;
    scene = new Scene();
    #isDepthSorting = true;
    #isRunning = false;
    #lastFrameTime = 0;
    #fps = 0;
    #isFrameRateCounter = false;
    #onFrameUpdate = null;
    #defaultEdgeColor = '#008000';
    #depthFog = {
        enabled: false,
        color: '#000000',
        near: 5,
        far: 50
    }

    // endregion

    // region Constructor

    /**
     * Creates a new Engine instance.
     * @param {HTMLCanvasElement} canvas - The canvas element to render to.
     */
    constructor(canvas) {
        this.#renderer = new Renderer(canvas);
        this.#camera = new Camera(new Vector2(canvas.width, canvas.height));
    }

    // endregion

    // region Getter Properties

    /**
     * Gets the camera instance.
     * @returns {Camera} The camera.
     */
    get camera() {
        return this.#camera;
    }

    /**
     * Gets the current depth fog configuration.
     * @returns {{enabled: boolean, color: string, near: number, far: number}} The fog settings.
     */
    get depthFog() {
        return {...this.#depthFog};
    }

    /**
     * Gets the background color.
     * @returns {string} The background color.
     */
    get backgroundColor() {
        return this.#renderer.backgroundColor;
    }

    /**
     * Gets the background gradient end color.
     * @returns {string|null} The gradient end color, or null if no gradient.
     */
    get backgroundGradientColor() {
        return this.#renderer.backgroundGradientColor;
    }

    /**
     * Gets the debug text color (used for FPS counter).
     * @returns {string} The debug text color.
     */
    get debugTextColor() {
        return this.#renderer.debugTextColor;
    }

    /**
     * Gets the default edge color for faces without explicit color.
     * @returns {string} The default edge color.
     */
    get defaultEdgeColor() {
        return this.#defaultEdgeColor;
    }

    /**
     * Gets the current bloom configuration.
     * @returns {{enabled: boolean, blur: number, color: string|null}} Bloom settings.
     */
    get bloom() {
        return this.#renderer.bloom;
    }

    get isBackgroundGradient() {
        return this.#renderer.isBackgroundGradient;
    }

    // endregion

    // region Setter Properties

    set onFrameUpdate(callback) {
        this.#onFrameUpdate = callback;
    }

    /**
     * Toggles depth sorting on or off (on by default).
     * When enabled, faces are sorted back-to-front and filled with background color
     * to create the illusion of solid objects (painter's algorithm).
     * @param {boolean} [enabled] - Sets the state directly.
     */
    set isDepthSorting(enabled) {
        this.#isDepthSorting = enabled;
    }

    /**
     * Configures depth fog effect (off by default, near=5, far=50, color #000000).
     * When enabled, objects fade toward the fog color based on their distance from the camera.
     * @param {{enabled?: boolean, color?: string, near?: number, far?: number}} options - Fog configuration.
     */
    set depthFog(options) {
        this.#depthFog = {...this.#depthFog, ...options};
    }

    /**
     * Sets the background color (black by default).
     * @param {string} color - The background color (hex string or CSS color).
     */
    set backgroundColor(color) {
        this.#renderer.backgroundColor = color;
    }

    /**
     * Sets the background gradient end color. Set to null to disable gradient (null by default).
     * @param {string|null} color - The gradient end color, or null to disable.
     */
    set backgroundGradientColor(color) {
        this.#renderer.backgroundGradientColor = color;
    }

    /**
     * Sets the debug text color (used for FPS counter and is white by default).
     * @param {string} color - The debug text color.
     */
    set debugTextColor(color) {
        this.#renderer.debugTextColor = color;
    }

    /**
     * Sets the default edge color for faces without explicit color (green by default).
     * @param {string} color - The default edge color.
     */
    set defaultEdgeColor(color) {
        this.#defaultEdgeColor = color;
    }

    /**
     * Enables or disables the FPS counter display (off by default).
     * @param {boolean} enabled - Whether to show the FPS counter.
     */
    set isFrameRateCounter(enabled) {
        this.#isFrameRateCounter = enabled;
    }

    /**
     * Configures global bloom effect (off by default, blur radius 5, glow color same as edges).
     * When enabled, edges glow with a soft blur effect.
     * @param {{enabled?: boolean, blur?: number, color?: string|null}} options - Bloom settings.
     *   - enabled: Whether bloom is active (default false)
     *   - blur: Blur radius in pixels (default 15)
     *   - color: Glow color, or null to use edge color (default null)
     */
    set bloom(options) {
        this.#renderer.bloom = options;
    }

    /**
     * Sets the screen size (determined by canvas size at initialization).
     * This can be called while/before/after the engine is running.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    set screenSize(newScreenSize) {
        this.#renderer.setScreenSize(newScreenSize);
        this.#camera.setScreenSize(newScreenSize);
    }

    // endregion

    // region Start/Stop Methods

    /**
     * Starts the render loop.
     */
    start() {
        this.#isRunning = true;
        this.#frameUpdate();
    }

    /**
     * Stops the render loop.
     */
    stop() {
        this.#isRunning = false;
    }

    // endregion

    // region Frame Update Methods

    /** @private */
    #frameUpdate() {
        if (!this.#isRunning)
            return;

        const now = performance.now();
        const deltaTime = this.#lastFrameTime ? (now - this.#lastFrameTime) / 1000 : 0;
        this.#lastFrameTime = now;
        this.#fps = deltaTime > 0 ? 1 / deltaTime : 0;

        if (this.#onFrameUpdate)
            this.#onFrameUpdate(deltaTime);

        this.#renderer.clear();
        this.#renderAllObjects();

        if (this.#isFrameRateCounter)
            this.#renderer.renderFPS(this.#fps);

        requestAnimationFrame(() => this.#frameUpdate());
    }

    /** @private */
    #renderAllObjects() {
        // Collect all projected faces from all objects
        const allFaces = [];

        for (const obj of this.scene.sceneObjects) {
            const projectedFaces = this.#camera.projectSceneObject(obj);
            allFaces.push(...projectedFaces);
        }

        // Sort if depth sorting is enabled (back-to-front)
        if (this.#isDepthSorting)
            allFaces.sort(ProjectedFace.compareByDepth);

        // Clear bloom canvas at start of frame
        const bloomEnabled = this.#renderer.isBloomEnabled();
        if (bloomEnabled)
            this.#renderer.clearBloomCanvas();

        // Render each face
        for (const face of allFaces) {
            const positions = face.screenPositions;

            // Determine edge color(s)
            let edgeColor = face.color || this.#defaultEdgeColor;
            let gradientEndColor = face.gradientColor;
            let fillColor = face.faceColor;

            // Apply depth fog if enabled
            if (this.#depthFog.enabled) {
                const fogAmount = ColorUtils.calculateFogAmount(
                    face.depth,
                    this.#depthFog.near,
                    this.#depthFog.far
                );

                edgeColor = ColorUtils.applyFog(edgeColor, this.#depthFog.color, fogAmount);

                if (gradientEndColor)
                    gradientEndColor = ColorUtils.applyFog(gradientEndColor, this.#depthFog.color, fogAmount);

                if (fillColor)
                    fillColor = ColorUtils.applyFog(fillColor, this.#depthFog.color, fogAmount);
            }

            // Fill face to occlude faces behind (depth sorting) or render face color
            if (this.#isDepthSorting) {
                let occlusionColor = fillColor;

                if (!occlusionColor) {
                    // Sample background color (or gradient) at face position
                    if (this.#renderer.isBackgroundGradient) {
                        // Calculate average Y position of face
                        let avgY = 0;
                        for (const pos of positions)
                            avgY += pos.y;
                        avgY /= positions.length;

                        // Interpolate gradient based on Y position (0 = top, 1 = bottom)
                        const t = avgY / this.#renderer.screenHeight;
                        occlusionColor = ColorUtils.interpolate(
                            this.#renderer.backgroundColor,
                            this.#renderer.backgroundGradientColor,
                            t
                        );
                    } else {
                        occlusionColor = this.#renderer.backgroundColor;
                    }
                }

                this.#renderer.fillFace(positions, occlusionColor);

                // Also fill on bloom canvas if bloom is enabled
                if (bloomEnabled)
                    this.#renderer.fillFaceOnBloom(positions, occlusionColor);
            }

            // Draw edges to main-canvas
            for (let i = 0; i < positions.length; i++) {
                const startPos = positions[i];
                const endPos = positions[(i + 1) % positions.length];

                if (gradientEndColor)
                    this.#renderer.renderEdgeGradient(startPos, endPos, edgeColor, gradientEndColor);
                else
                    this.#renderer.renderEdgeWithColor(startPos, endPos, edgeColor);

                // Also draw to bloom canvas if enabled
                if (!bloomEnabled)
                    continue;

                if (gradientEndColor)
                    this.#renderer.renderEdgeGradientToBloom(startPos, endPos, edgeColor, gradientEndColor);
                else
                    this.#renderer.renderEdgeToBloom(startPos, endPos, edgeColor);
            }
        }

        // Composite bloom at end-of-frame
        if (bloomEnabled) {
            this.#renderer.compositeBloom();
        }
    }

    // endregion
}
