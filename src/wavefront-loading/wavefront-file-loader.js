/**
 * Handles loading OBJ file content from various sources (URL, File, file dialog).
 */
export class WavefrontFileLoader {
    /**
     * Loads OBJ file content from an HTTP URL.
     * @param {string} url - The URL to fetch the OBJ file from.
     * @returns {Promise<string>} The text content of the OBJ file.
     * @throws {Error} If the fetch request fails.
     */
    static async loadFromUrl(url) {
        const response = await fetch(url);

        if (!response.ok)
            throw new Error(`Failed to load OBJ file: ${response.status} ${response.statusText}`);

        return await response.text();
    }

    /**
     * Loads OBJ file content from a File object.
     * @param {File} file - The File object from an input element.
     * @returns {Promise<string>} The text content of the OBJ file.
     * @throws {Error} If reading the file fails.
     */
    static async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));

            reader.readAsText(file);
        });
    }

    /**
     * Opens a file dialog for the user to select an OBJ file.
     * @returns {Promise<string>} The text content of the selected OBJ file.
     * @throws {Error} If no file is selected or reading fails.
     */
    static async loadFromFileDialog() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.obj';

            input.onchange = async () => {
                if (input.files && input.files[0]) {
                    try {
                        const text = await this.loadFromFile(input.files[0]);
                        resolve(text);
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject(new Error('No file selected'));
                }
            };

            input.click();
        });
    }
}
