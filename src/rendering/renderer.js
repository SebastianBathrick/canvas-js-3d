/**
 * Handles drawing wireframe graphics to a Canvas 2D context.
 */
export class Renderer {
    /**
     * Creates a new Renderer.
     * @param {HTMLCanvasElement} canvas - The canvas element to render to.
     * @param {string} fgColor - The foreground/stroke color (e.g., 'green', '#00ff00').
     * @param {string} bgColor - The background/clear color (e.g., 'black', '#000000').
     */
    constructor(canvas, fgColor, bgColor) {
        /** @type {HTMLCanvasElement} */
        this._canvas = canvas;
        /** @type {CanvasRenderingContext2D} */
        this._ctx = canvas.getContext('2d');
        /** @type {string} */
        this._fgColor = fgColor;
        /** @type {string} */
        this._bgColor = bgColor;
        /** @type {string|null} */
        this._bgGradientColor = null;
        /** @type {number} */
        this._pointSize = 20;
        /** @type {{enabled: boolean, blur: number, color: string|null}} */
        this._bloom = { enabled: false, blur: 15, color: null };
    }

    /**
     * Gets the background color.
     * @returns {string} The background color.
     */
    getBgColor() {
        return this._bgColor;
    }

    /**
     * Sets the background color.
     * @param {string} color - The new background color (hex string or CSS color).
     */
    setBgColor(color) {
        this._bgColor = color;
    }

    /**
     * Gets the background gradient end color.
     * @returns {string|null} The gradient end color, or null if no gradient.
     */
    getBgGradientColor() {
        return this._bgGradientColor;
    }

    /**
     * Sets the background gradient end color. Set to null to disable gradient.
     * @param {string|null} color - The gradient end color, or null to disable.
     */
    setBgGradientColor(color) {
        this._bgGradientColor = color;
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
     * Begins bloom rendering. Call once per frame before drawing edges.
     */
    beginBloom() {
        if (this._bloom.enabled) {
            this._ctx.shadowBlur = this._bloom.blur;
            this._ctx.shadowOffsetX = 0;
            this._ctx.shadowOffsetY = 0;
            if (this._bloom.color) {
                this._ctx.shadowColor = this._bloom.color;
            }
        }
    }

    /**
     * Updates bloom color for per-edge coloring. Only needed when bloom.color is null.
     * @param {string} color - The edge color to use for glow.
     */
    setBloomColor(color) {
        this._ctx.shadowColor = color;
    }

    /**
     * Ends bloom rendering. Call once per frame after drawing all edges.
     */
    endBloom() {
        if (this._bloom.enabled) {
            this._ctx.shadowBlur = 0;
        }
    }

    /**
     * Temporarily disables bloom for operations like face fills.
     */
    pauseBloom() {
        this._ctx.shadowBlur = 0;
    }

    /**
     * Restores bloom after a pause.
     */
    resumeBloom() {
        this._ctx.shadowBlur = this._bloom.blur;
    }

    /**
     * Checks if bloom is currently enabled.
     * @returns {boolean} True if bloom is enabled.
     */
    isBloomEnabled() {
        return this._bloom.enabled;
    }

    /**
     * Checks if bloom needs per-edge color updates.
     * @returns {boolean} True if bloom is enabled but has no fixed color.
     */
    needsPerEdgeBloomColor() {
        return this._bloom.enabled && !this._bloom.color;
    }

    /**
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this._canvas.width = newScreenSize.x;
        this._canvas.height = newScreenSize.y;
        this._ctx.scale(newScreenSize.x / this._canvas.width, newScreenSize.y / this._canvas.height);
    }

    /**
     * Clears the canvas with the background color or gradient.
     */
    clear() {
        if (this._bgGradientColor) {
            const gradient = this._ctx.createLinearGradient(
                0, 0,
                0, this._canvas.height
            );
            gradient.addColorStop(0, this._bgColor);
            gradient.addColorStop(1, this._bgGradientColor);
            this._ctx.fillStyle = gradient;
        } else {
            this._ctx.fillStyle = this._bgColor;
        }
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    /**
     * Renders a line between two screen positions.
     * @param {Vector2} startVector2 - The start position in screen coordinates.
     * @param {Vector2} endVector2 - The end position in screen coordinates.
     */
    renderEdge(startVector2, endVector2) {
        this._ctx.strokeStyle = this._fgColor;
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
        this._ctx.fillStyle = this._fgColor;
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
}
