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
        this.canvas = canvas;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = canvas.getContext('2d');
        /** @type {string} */
        this.fgColor = fgColor;
        /** @type {string} */
        this.bgColor = bgColor;
        /** @type {number} @private */
        this._pointSize = 20;
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
     * Sets the screen size.
     * @param {Vector2} newScreenSize - The new screen size.
     */
    setScreenSize(newScreenSize) {
        this.canvas.width = newScreenSize.x;
        this.canvas.height = newScreenSize.y;
        this.ctx.scale(newScreenSize.x / this.canvas.width, newScreenSize.y / this.canvas.height);
    }

    /**
     * Clears the canvas with the background color.
     */
    clear() {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Renders a line between two screen positions.
     * @param {Vector2} startVector2 - The start position in screen coordinates.
     * @param {Vector2} endVector2 - The end position in screen coordinates.
     */
    renderEdge(startVector2, endVector2) {
        this.ctx.strokeStyle = this.fgColor;
        this.ctx.beginPath();
        this.ctx.moveTo(startVector2.x, startVector2.y);
        this.ctx.lineTo(endVector2.x, endVector2.y);
        this.ctx.stroke();
    }

    /**
     * Renders a point as a square at the given screen position.
     * @param {Vector2} vector2 - The position in screen coordinates.
     */
    renderPoint(vector2) {
        this.ctx.fillStyle = this.fgColor;
        this.ctx.fillRect(
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

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(positions[0].x, positions[0].y);

        for (let i = 1; i < positions.length; i++) {
            this.ctx.lineTo(positions[i].x, positions[i].y);
        }

        this.ctx.closePath();
        this.ctx.fill();
    }
}
