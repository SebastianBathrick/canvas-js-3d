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
    }

    /**
     * Adds a scene object to the scene.
     * @param {SceneObject} sceneObject - The object to add.
     */
    addSceneObject(sceneObject) {
        this._sceneObjects.push(sceneObject);
    }

    /**
     * Removes a scene object from the scene.
     * @param {SceneObject} sceneObject - The object to remove.
     */
    removeSceneObject(sceneObject) {
        const idx = this._sceneObjects.indexOf(sceneObject);

        if (idx !== -1)
            this._sceneObjects.splice(idx, 1);
    }

    /**
     * Gets all scene objects in the scene.
     * @returns {SceneObject[]} Array of scene objects.
     */
    getSceneObjects() {
        return this._sceneObjects;
    }
}
