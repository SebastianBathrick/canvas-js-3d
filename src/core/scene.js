/**
 * A container for scene objects in a 3D scene.
 */
export class Scene {
    #sceneObjects = [];
    #nextId = 1;
    #idToObject = new Map();
    #objectToId = new Map();

    /**`
     * Creates a new Scene.
     */
    constructor() {

    }

    /**
     * Gets all scene objects in the scene.
     * @returns {SceneObject[]} Array of scene objects.
     */
    get sceneObjects() {
        return [...this.#sceneObjects];
    }

    /**
     * Adds a scene object to the scene.
     * @param {SceneObject} sceneObject - The object to add.
     * @returns {number} The unique ID assigned to the scene object.
     * @throws {Error} If the scene object is already in the scene.
     */
    addSceneObject(sceneObject) {
        if (this.#objectToId.has(sceneObject)) {
            throw new Error('Scene object is already in the scene');
        }

        const id = this.#nextId++;
        this.#sceneObjects.push(sceneObject);
        this.#idToObject.set(id, sceneObject);
        this.#objectToId.set(sceneObject, id);
        return id;
    }

    /**
     * Removes a scene object from the scene.
     * @param {SceneObject} sceneObject - The object to remove.
     */
    removeSceneObject(sceneObject) {
        const idx = this.#sceneObjects.indexOf(sceneObject);

        if (idx !== -1) {
            this.#sceneObjects.splice(idx, 1);
            const id = this.#objectToId.get(sceneObject);
            if (id !== undefined) {
                this.#idToObject.delete(id);
                this.#objectToId.delete(sceneObject);
            }
        }
    }

    /**
     * Gets a scene object by its unique ID.
     * @param {number} id - The unique ID of the scene object.
     * @returns {SceneObject|undefined} The scene object, or undefined if not found.
     */
    getSceneObjectById(id) {
        return this.#idToObject.get(id);
    }
}
