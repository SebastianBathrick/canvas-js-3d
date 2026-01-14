/**
 * A container for scene objects in a 3D scene.
 */
export class Scene {
    /**
     * Creates a new Scene.
     */
    constructor() {
        /** @type {SceneObject[]} */
        this._sceneObjects = [];
        /** @type {number} */
        this._nextId = 1;
        /** @type {Map<number, SceneObject>} */
        this._idToObject = new Map();
        /** @type {Map<SceneObject, number>} */
        this._objectToId = new Map();
    }

    /**
     * Adds a scene object to the scene.
     * @param {SceneObject} sceneObject - The object to add.
     * @returns {number} The unique ID assigned to the scene object.
     * @throws {Error} If the scene object is already in the scene.
     */
    addSceneObject(sceneObject) {
        if (this._objectToId.has(sceneObject)) {
            throw new Error('Scene object is already in the scene');
        }

        const id = this._nextId++;
        this._sceneObjects.push(sceneObject);
        this._idToObject.set(id, sceneObject);
        this._objectToId.set(sceneObject, id);
        return id;
    }

    /**
     * Removes a scene object from the scene.
     * @param {SceneObject} sceneObject - The object to remove.
     */
    removeSceneObject(sceneObject) {
        const idx = this._sceneObjects.indexOf(sceneObject);

        if (idx !== -1) {
            this._sceneObjects.splice(idx, 1);
            const id = this._objectToId.get(sceneObject);
            if (id !== undefined) {
                this._idToObject.delete(id);
                this._objectToId.delete(sceneObject);
            }
        }
    }

    /**
     * Gets all scene objects in the scene.
     * @returns {SceneObject[]} Array of scene objects.
     */
    getSceneObjects() {
        return this._sceneObjects;
    }

    /**
     * Gets a scene object by its unique ID.
     * @param {number} id - The unique ID of the scene object.
     * @returns {SceneObject|undefined} The scene object, or undefined if not found.
     */
    getSceneObjectById(id) {
        return this._idToObject.get(id);
    }

    /**
     * Gets the unique ID of a scene object.
     * @param {SceneObject} sceneObject - The scene object.
     * @returns {number|undefined} The unique ID, or undefined if not in the scene.
     */
    getSceneObjectId(sceneObject) {
        return this._objectToId.get(sceneObject);
    }
}
