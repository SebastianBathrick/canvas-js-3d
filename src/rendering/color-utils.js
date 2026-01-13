/**
 * Utility class for color manipulation and interpolation.
 */
export class ColorUtils {
    /**
     * Parses a hex color string to RGB components.
     * @param {string} hex - Hex color string (e.g., '#ff00ff' or 'ff00ff').
     * @returns {{r: number, g: number, b: number}} RGB components (0-255).
     */
    static hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace(/^#/, '');
        
        // Handle shorthand (e.g., 'f0f' -> 'ff00ff')
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const num = parseInt(hex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    /**
     * Converts RGB components to a hex color string.
     * @param {number} r - Red component (0-255).
     * @param {number} g - Green component (0-255).
     * @param {number} b - Blue component (0-255).
     * @returns {string} Hex color string (e.g., '#ff00ff').
     */
    static rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    /**
     * Linearly interpolates between two colors.
     * @param {string} color1 - Start color (hex string).
     * @param {string} color2 - End color (hex string).
     * @param {number} t - Interpolation factor (0 = color1, 1 = color2).
     * @returns {string} Interpolated color (hex string).
     */
    static interpolate(color1, color2, t) {
        const c1 = ColorUtils.hexToRgb(color1);
        const c2 = ColorUtils.hexToRgb(color2);
        
        // Clamp t to [0, 1]
        t = Math.max(0, Math.min(1, t));
        
        return ColorUtils.rgbToHex(
            c1.r + (c2.r - c1.r) * t,
            c1.g + (c2.g - c1.g) * t,
            c1.b + (c2.b - c1.b) * t
        );
    }

    /**
     * Applies fog effect by blending a color toward a fog color.
     * @param {string} color - Original color (hex string).
     * @param {string} fogColor - Fog color to blend toward (hex string).
     * @param {number} fogAmount - Amount of fog (0 = no fog, 1 = fully fogged).
     * @returns {string} Color with fog applied (hex string).
     */
    static applyFog(color, fogColor, fogAmount) {
        return ColorUtils.interpolate(color, fogColor, fogAmount);
    }

    /**
     * Calculates fog amount based on depth and near/far planes.
     * @param {number} depth - The depth value (z distance from camera).
     * @param {number} near - Near fog plane (fog starts here).
     * @param {number} far - Far fog plane (fully fogged at this distance).
     * @returns {number} Fog amount (0 = no fog, 1 = fully fogged).
     */
    static calculateFogAmount(depth, near, far) {
        if (depth <= near) return 0;
        if (depth >= far) return 1;
        return (depth - near) / (far - near);
    }
}
