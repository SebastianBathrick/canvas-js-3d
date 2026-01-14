/**
 * Handles drawing wireframe graphics to a Canvas 2D context.
 */
export class Renderer {
    /**
     * Creates a new Renderer.
     * @param {HTMLCanvasElement} canvas - The canvas element to render to.
     */
    constructor(canvas) {
        /** @type {HTMLCanvasElement} */
        this._canvas = canvas;
        /** @type {CanvasRenderingContext2D} */
        this._ctx = canvas.getContext('2d');
        /** @type {string} */
        this._backgroundColor = '#000000';
        /** @type {string|null} */
        this._backgroundGradientColor = null;
        /** @type {string} */
        this._debugTextColor = '#ffffff';
        /** @type {number} */
        this._pointSize = 20;
        /** @type {{enabled: boolean, blur: number, color: string|null}} */
        this._bloom = { enabled: false, blur: 15, color: null };
        /** @type {HTMLCanvasElement|null} */
        this._bloomCanvas = null;
        /** @type {CanvasRenderingContext2D|null} */
        this._bloomCtx = null;
    }

    /**
     * Gets the background color.
     * @returns {string} The background color.
     */
    getBackgroundColor() {
        return this._backgroundColor;
    }

    /**
     * Sets the background color.
     * @param {string} color - The new background color (hex string or CSS color).
     */
    setBackgroundColor(color) {
        this._backgroundColor = color;
    }

    /**
     * Gets the background gradient end color.
     * @returns {string|null} The gradient end color, or null if no gradient.
     */
    getBackgroundGradientColor() {
        return this._backgroundGradientColor;
    }

    /**
     * Sets the background gradient end color. Set to null to disable gradient.
     * @param {string|null} color - The gradient end color, or null to disable.
     */
    setBackgroundGradientColor(color) {
        this._backgroundGradientColor = color;
    }

    /**
     * Gets the debug text color (used for FPS counter).
     * @returns {string} The debug text color.
     */
    getDebugTextColor() {
        return this._debugTextColor;
    }

    /**
     * Sets the debug text color (used for FPS counter).
     * @param {string} color - The new debug text color.
     */
    setDebugTextColor(color) {
        this._debugTextColor = color;
    }

    /**
     * Gets the point size for renderPoint.
     * @returns {number} The point size in pixels.
     */
    getPointSize() {
        return this._pointSize;
    }

    /**
     * Sets the point size for renderPoint.
     * @param {number} size - The new point size in pixels.
     */
    setPointSize(size) {
        this._pointSize = size;
    }

    /**
     * Configures global bloom effect.
     * @param {{enabled?: boolean, blur?: number, color?: string|null}} options - Bloom settings.
     */
    setBloom(options) {
        if (options.enabled !== undefined) this._bloom.enabled = options.enabled;
        if (options.blur !== undefined) this._bloom.blur = options.blur;
        if (options.color !== undefined) this._bloom.color = options.color;
    }

    /**
     * Gets the current bloom configuration.
     * @returns {{enabled: boolean, blur: number, color: string|null}} Bloom settings.
     */
    getBloom() {
        return { ...this._bloom };
    }

    /**
     * Checks if bloom is currently enabled.
     * @returns {boolean} True if bloom is enabled.
     */
    isBloomEnabled() {
        return this._bloom.enabled;
    }

    /** @private */
    _initBloomCanvas() {
        if (!this._bloomCanvas) {
            this._bloomCanvas = document.createElement('canvas');
            this._bloomCtx = this._bloomCanvas.getContext('2d');
        }
        if (this._bloomCanvas.width !== this._canvas.width ||
            this._bloomCanvas.height !== this._canvas.height) {
            this._bloomCanvas.width = this._canvas.width;
            this._bloomCanvas.height = this._canvas.height;
        }
    }

    /**
     * Clears the bloom canvas for a new frame.
     */
    clearBloomCanvas() {
        if (!this._bloom.enabled) return;
        this._initBloomCanvas();
        this._bloomCtx.clearRect(0, 0, this._bloomCanvas.width, this._bloomCanvas.height);
    }

    /**
     * Renders an edge to the bloom canvas.
     * @param {Vector2} startVector2 - The start position.
     * @param {Vector2} endVector2 - The end position.
     * @param {string} color - The stroke color.
     */
    renderEdgeToBloom(startVector2, endVector2, color) {
        const ctx = this._bloomCtx;
        ctx.strokeStyle = this._bloom.color || color;
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
        const ctx = this._bloomCtx;
        if (this._bloom.color) {
            ctx.strokeStyle = this._bloom.color;
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
     * Applies blur to bloom canvas and composites onto main canvas.
     */
    compositeBloom() {
        if (!this._bloom.enabled || !this._bloomCanvas) return;

        // Apply blur filter and draw to main canvas with additive blending
        this._ctx.save();
        this._ctx.filter = `blur(${this._bloom.blur}px)`;
        this._ctx.globalCompositeOperation = 'lighter';
        this._ctx.drawImage(this._bloomCanvas, 0, 0);
        this._ctx.restore();
    }

    /**
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this._canvas.width = newScreenSize.x;
        this._canvas.height = newScreenSize.y;
        // Bloom canvas will be resized on next clearBloomCanvas call
    }

    /**
     * Clears the canvas with the background color or gradient.
     */
    clear() {
        if (this._backgroundGradientColor) {
            const gradient = this._ctx.createLinearGradient(
                0, 0,
                0, this._canvas.height
            );
            gradient.addColorStop(0, this._backgroundColor);
            gradient.addColorStop(1, this._backgroundGradientColor);
            this._ctx.fillStyle = gradient;
        } else {
            this._ctx.fillStyle = this._backgroundColor;
        }
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    /**
     * Renders a line between two screen positions.
     * @param {Vector2} startVector2 - The start position in screen coordinates.
     * @param {Vector2} endVector2 - The end position in screen coordinates.
     */
    renderEdge(startVector2, endVector2) {
        this._ctx.strokeStyle = this._debugTextColor;
        this._ctx.beginPath();
        this._ctx.moveTo(startVector2.x, startVector2.y);
        this._ctx.lineTo(endVector2.x, endVector2.y);
        this._ctx.stroke();
    }

    /**
     * Renders a line between two screen positions with a specific color.
     * @param {Vector2} startVector2 - The start position in screen coordinates.
     * @param {Vector2} endVector2 - The end position in screen coordinates.
     * @param {string} color - The stroke color (hex string or CSS color).
     */
    renderEdgeWithColor(startVector2, endVector2, color) {
        this._ctx.strokeStyle = color;
        this._ctx.beginPath();
        this._ctx.moveTo(startVector2.x, startVector2.y);
        this._ctx.lineTo(endVector2.x, endVector2.y);
        this._ctx.stroke();
    }

    /**
     * Renders a line between two screen positions with a linear gradient.
     * @param {Vector2} startVector2 - The start position in screen coordinates.
     * @param {Vector2} endVector2 - The end position in screen coordinates.
     * @param {string} startColor - The color at the start of the edge.
     * @param {string} endColor - The color at the end of the edge.
     */
    renderEdgeGradient(startVector2, endVector2, startColor, endColor) {
        const gradient = this._ctx.createLinearGradient(
            startVector2.x, startVector2.y,
            endVector2.x, endVector2.y
        );
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);

        this._ctx.strokeStyle = gradient;
        this._ctx.beginPath();
        this._ctx.moveTo(startVector2.x, startVector2.y);
        this._ctx.lineTo(endVector2.x, endVector2.y);
        this._ctx.stroke();
    }

    /**
     * Renders a point as a square at the given screen position.
     * @param {Vector2} vector2 - The position in screen coordinates.
     */
    renderPoint(vector2) {
        this._ctx.fillStyle = this._debugTextColor;
        this._ctx.fillRect(
            vector2.x - this._pointSize / 2,
            vector2.y - this._pointSize / 2,
            this._pointSize,
            this._pointSize
        );
    }

    /**
     * Fills a polygon defined by screen positions.
     * @param {Vector2[]} positions - The vertex positions in screen coordinates.
     * @param {string} color - The fill color.
     */
    fillFace(positions, color) {
        if (positions.length < 3)
            return;

        this._ctx.fillStyle = color;
        this._ctx.beginPath();
        this._ctx.moveTo(positions[0].x, positions[0].y);

        for (let i = 1; i < positions.length; i++) {
            this._ctx.lineTo(positions[i].x, positions[i].y);
        }

        this._ctx.closePath();
        this._ctx.fill();
    }

    /**
     * Renders an FPS counter at the top-right corner of the canvas.
     * @param {number} fps - The current frames per second value.
     */
    renderFPS(fps) {
        const text = `${Math.round(fps)} FPS`;
        const padding = 10;

        this._ctx.save();
        this._ctx.font = '14px monospace';
        this._ctx.textAlign = 'right';
        this._ctx.textBaseline = 'top';
        this._ctx.fillStyle = this._debugTextColor;
        this._ctx.fillText(text, this._canvas.width - padding, padding);
        this._ctx.restore();
    }
}
