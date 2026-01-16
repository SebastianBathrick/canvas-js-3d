/**
 * Handles drawing wireframe graphics to a Canvas 2D context.
 */
export class Renderer {
    // region Fields

    #canvas;
    #ctx;
    #backgroundColor = '#000000';
    #backgroundGradientColor = null;
    #debugTextColor = '#ffffff';
    #pointSize = 20;
    #bloom = {enabled: false, blur: 5, color: null};
    #bloomCanvas;
    #bloomCtx;

    // endregion

    // region Constructor

    /**
     * Creates a new Renderer.
     * @param {HTMLCanvasElement} canvas - The canvas element to render to.
     */
    constructor(canvas) {
        /** @type {HTMLCanvasElement} */
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d');
    }

    // endregion

    // region Getter Properties

    /**
     * Gets the background color.
     * @returns {string} The background color.
     */
    get backgroundColor() {
        return this.#backgroundColor;
    }

    get isBackgroundGradient() {
        return this.#backgroundGradientColor !== null;
    }

    /**
     * Gets the canvas height.
     * @returns {number} The canvas height in pixels.
     */
    get screenHeight() {
        return this.#canvas.height;
    }

    /**
     * Gets the background gradient end color.
     * @returns {string|null} The gradient end color, or null if no gradient.
     */
    get backgroundGradientColor() {
        return this.#backgroundGradientColor;
    }

    /**
     * Gets the debug text color (used for FPS counter).
     * @returns {string} The debug text color.
     */
    get debugTextColor() {
        return this.#debugTextColor;
    }

    /**
     * Gets the point size for renderPoint.
     * @returns {number} The point size in pixels.
     */
    get pointSize() {
        return this.#pointSize;
    }

    /**
     * Gets the current bloom configuration.
     * @returns {{enabled: boolean, blur: number, color: string|null}} Bloom settings.
     */
    get bloom() {
        return {...this.#bloom};
    }

    // endregion

    // region Setter Properties

    /**
     * Sets the background color.
     * @param {string} color - The new background color (hex string or CSS color).
     */
    set backgroundColor(color) {
        this.#backgroundColor = color;
    }

    /**
     * Sets the background gradient end color. Set to null to disable gradient.
     * @param {string|null} color - The gradient end color, or null to disable.
     */
    set backgroundGradientColor(color) {
        this.#backgroundGradientColor = color;
    }

    /**
     * Sets the debug text color (used for FPS counter).
     * @param {string} color - The new debug text color.
     */
    set debugTextColor(color) {
        this.#debugTextColor = color;
    }

    /**
     * Sets the point size for renderPoint.
     * @param {number} size - The new point size in pixels.
     */
    set pointSize(size) {
        this.#pointSize = size;
    }

    /**
     * Configures global bloom effect.
     * @param {{enabled?: boolean, blur?: number, color?: string|null}} options - Bloom settings.
     */
    set bloom(options) {
        this.#bloom = {...this.#bloom, ...options};
    }

    // endregion

    // region Bloom Methods

    /**
     * Checks if bloom is currently enabled.
     * @returns {boolean} True if bloom is enabled.
     */
    isBloomEnabled() {
        return this.#bloom.enabled;
    }

    /**
     * Renders an edge to the bloom canvas.
     * @param {Vector2} startVector2 - The start position.
     * @param {Vector2} endVector2 - The end position.
     * @param {string} color - The stroke color.
     */
    renderEdgeToBloom(startVector2, endVector2, color) {
        const ctx = this.#bloomCtx;
        ctx.strokeStyle = this.#bloom.color || color;
        ctx.beginPath();
        ctx.moveTo(startVector2.x, startVector2.y);
        ctx.lineTo(endVector2.x, endVector2.y);
        ctx.stroke();
    }

    /**
     * Renders a gradient edge to the bloom canvas.
     * @param {Vector2} startVector2 - The start position.
     * @param {Vector2} endVector2 - The end position.
     * @param {string} startColor - The color at the start.
     * @param {string} endColor - The color at the end.
     */
    renderEdgeGradientToBloom(startVector2, endVector2, startColor, endColor) {
        const ctx = this.#bloomCtx;
        if (this.#bloom.color) {
            ctx.strokeStyle = this.#bloom.color;
        } else {
            const gradient = ctx.createLinearGradient(
                startVector2.x, startVector2.y,
                endVector2.x, endVector2.y
            );
            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, endColor);
            ctx.strokeStyle = gradient;
        }
        ctx.beginPath();
        ctx.moveTo(startVector2.x, startVector2.y);
        ctx.lineTo(endVector2.x, endVector2.y);
        ctx.stroke();
    }

    /**
     * Clears the bloom canvas for a new frame.
     */
    clearBloomCanvas() {
        if (!this.#bloom.enabled)
            return;

        this.#initBloomCanvas();
        this.#bloomCtx.clearRect(0, 0, this.#bloomCanvas.width, this.#bloomCanvas.height);
    }

    /**
     * Fills a face on the bloom canvas (for depth sorting occlusion).
     * @param {Vector2[]} positions - Array of screen positions forming the face.
     * @param {string} color - Fill color.
     */
    fillFaceOnBloom(positions, color) {
        if (!this.#bloom.enabled || !this.#bloomCanvas)
            return;

        const ctx = this.#bloomCtx;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(positions[0].x, positions[0].y);

        for (let i = 1; i < positions.length; i++)
            ctx.lineTo(positions[i].x, positions[i].y);

        ctx.closePath();
        ctx.fill();
    }


    /**
     * Applies blur to bloom canvas and composites onto main canvas.
     */
    compositeBloom() {
        if (!this.#bloom.enabled || !this.#bloomCanvas)
            return;

        // Apply blur filter and draw to main canvas with additive blending
        this.#ctx.save();
        this.#ctx.filter = `blur(${this.#bloom.blur}px)`;
        this.#ctx.globalCompositeOperation = 'lighter';
        this.#ctx.drawImage(this.#bloomCanvas, 0, 0);
        this.#ctx.restore();
    }

    /** @private */
    #initBloomCanvas() {
        if (!this.#bloomCanvas) {
            this.#bloomCanvas = document.createElement('canvas');
            this.#bloomCtx = this.#bloomCanvas.getContext('2d');
        }
        if (this.#bloomCanvas.width !== this.#canvas.width ||
            this.#bloomCanvas.height !== this.#canvas.height) {
            this.#bloomCanvas.width = this.#canvas.width;
            this.#bloomCanvas.height = this.#canvas.height;
        }
    }

    // endregion

    // region Render Methods

    /**
     * Renders a line between two screen positions with a specific color.
     * @param {Vector2} startVector2 - The start position in screen coordinates.
     * @param {Vector2} endVector2 - The end position in screen coordinates.
     * @param {string} color - The stroke color (hex string or CSS color).
     */
    renderEdgeWithColor(startVector2, endVector2, color) {
        this.#ctx.strokeStyle = color;
        this.#ctx.beginPath();
        this.#ctx.moveTo(startVector2.x, startVector2.y);
        this.#ctx.lineTo(endVector2.x, endVector2.y);
        this.#ctx.stroke();
    }

    /**
     * Renders a line between two screen positions with a linear gradient.
     * @param {Vector2} startVector2 - The start position in screen coordinates.
     * @param {Vector2} endVector2 - The end position in screen coordinates.
     * @param {string} startColor - The color at the start of the edge.
     * @param {string} endColor - The color at the end of the edge.
     */
    renderEdgeGradient(startVector2, endVector2, startColor, endColor) {
        const gradient = this.#ctx.createLinearGradient(
            startVector2.x, startVector2.y,
            endVector2.x, endVector2.y
        );
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);

        this.#ctx.strokeStyle = gradient;
        this.#ctx.beginPath();
        this.#ctx.moveTo(startVector2.x, startVector2.y);
        this.#ctx.lineTo(endVector2.x, endVector2.y);
        this.#ctx.stroke();
    }

    /**
     * Fills a polygon defined by screen positions.
     * @param {Vector2[]} positions - The vertex positions in screen coordinates.
     * @param {string} color - The fill color.
     */
    fillFace(positions, color) {
        if (positions.length < 3)
            return;

        this.#ctx.fillStyle = color;
        this.#ctx.beginPath();
        this.#ctx.moveTo(positions[0].x, positions[0].y);

        for (let i = 1; i < positions.length; i++)
            this.#ctx.lineTo(positions[i].x, positions[i].y);


        this.#ctx.closePath();
        this.#ctx.fill();
    }


    /**
     * Renders an FPS counter in the top right corner of the canvas.
     * @param {number} fps - The current frames per second value.
     * @param {string} [font] - The font to use for the text. Default is '14px monospace'.
     * @param {string} horizontalAlign - The horizontal alignment of the text. Default is 'right'.
     * @param {string} verticalAlign - The vertical alignment of the text. Default is 'top'.
     */
    renderFPS(fps, font = '14px monospace', horizontalAlign = 'right', verticalAlign = 'top') {
        const text = `${Math.round(fps)} FPS`;
        const padding = 10;

        this.#ctx.save();
        this.#ctx.font = font;
        this.#ctx.textAlign = horizontalAlign;
        this.#ctx.textBaseline = verticalAlign;
        this.#ctx.fillStyle = this.#debugTextColor;
        this.#ctx.fillText(text, this.#canvas.width - padding, padding);
        this.#ctx.restore();
    }


    // TODO: Add a way for the client to enable, disable, and pick the color of points
    /**
     * Renders a point as a square at the given screen position.
     * @param {Vector2} vector2 - The position in screen coordinates.
     */
    renderPoint(vector2) {
        this.#ctx.fillStyle = this.#debugTextColor;
        this.#ctx.fillRect(
            vector2.x - this.#pointSize / 2,
            vector2.y - this.#pointSize / 2,
            this.#pointSize,
            this.#pointSize
        );
    }

    // endregion

    // region Utility Methods

    /**
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this.#canvas.width = newScreenSize.x;
        this.#canvas.height = newScreenSize.y;
        // Bloom canvas will be resized on next clearBloomCanvas call
    }

    /**
     * Clears the canvas with the background color or gradient.
     */
    clear() {
        if (this.#backgroundGradientColor) {
            const gradient = this.#ctx.createLinearGradient(
                0, 0,
                0, this.#canvas.height
            );
            gradient.addColorStop(0, this.#backgroundColor);
            gradient.addColorStop(1, this.#backgroundGradientColor);
            this.#ctx.fillStyle = gradient;
        } else {
            this.#ctx.fillStyle = this.#backgroundColor;
        }
        this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    // endregion
}
