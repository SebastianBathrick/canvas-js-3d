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
        /** @type {number} */
        this.pointSize = 20;
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
            vector2.x - this.pointSize / 2,
            vector2.y - this.pointSize / 2,
            this.pointSize,
            this.pointSize
        );
    }
}
