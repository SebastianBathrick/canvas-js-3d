/**
 * Demo scene for the `canvas-js-3d` library.
 *
 * This file is intentionally set up as a simple, interactive showcase of the engine + inspector UI,
 * not as production app code.
 *
 * Hosted demo:
 * https://sebastianbathrick.github.io/canvas-js-3d/
 *
 * Source repo:
 * https://github.com/SebastianBathrick/canvas-js-3d
 *
 * License: MIT
 * Copyright (c) Sebastian Bathrick
 */


// region Constants
const SCENE_OBJ_DEFAULT_EDGE_COLOR = "#ffffff";
const SCENE_OBJ_DEFAULT_FACE_COLOR = "#2E2E2E";
const DEFAULT_BACKGROUND_COLOR = "#000000";
const DEFAULT_BACKGROUND_GRADIENT_COLOR = "#1a1a2e";
const SELECTED_OBJ_TRANSFORM_PANEL_ID = "selected-obj-transform-panel";
const DEFAULT_SELECTED_OBJ_ROTATE_SPEED = 0.4;
const SELECTED_OBJ_MIN_ROTATE_SPEED = 0.05;
const SELECTED_OBJ_MAX_ROTATE_SPEED = 1.0;
const SELECTED_OBJ_ROTATE_SPEED_SLIDER_INC = 0.01;

// The select element where the user picks from a limited list of predefined meshes
const CREATE_SCENE_OBJ_MESH_SELECT_ID = "create-scene-obj-mesh-select";

// The select element that's used to display the list of current scene objects
const SCENE_OBJS_SELECT_ID = "scene-objs-select";
const INSPECTOR_PANEL_ID = "inspector-panel";
const VIEWPORT_PANEL_ID = "viewport-panel";
const CREATE_SCENE_OBJ_BTN_ID = "create-scene-obj-btn";
const REMOVE_SCENE_OBJ_BTN_ID = "remove-scene-obj-btn";
const CLEAR_SCENE_OBJS_BTN_ID = "clear-scene-objs-btn";

const TRANSFORM_SETTINGS_TEMPLATE_ID = "settings-input-transform-template";
const VECTOR_INPUT_TEMPLATE_ID = "settings-input-vector-template";
const SETTINGS_INPUT_CHECKBOX_TEMPLATE_ID = "settings-input-checkbox-template";
const SETTINGS_INPUT_SLIDER_TEMPLATE_ID = "settings-input-slider-template";
const SETTINGS_INPUT_COLOR_TEMPLATE_ID = "settings-input-color-template";
const SETTINGS_INPUT_GRADIENT_TEMPLATE_ID = "settings-input-gradient-template";

const MOBILE_WIDTH_THRESHOLD = 768;
const MOBILE_INSPECTOR_HEIGHT = 300;
const DESKTOP_INSPECTOR_WIDTH = 300;

const POS_INC = 0.5;
const ROT_INC = .01;
const SCALE_INC = 0.1;

const POS_PREFIX = "pos";
const ROT_PREFIX = "rot";
const SCALE_PREFIX = "scale";
const POS_LABEL = "Position";
const ROT_LABEL = "Rotation";
const SCALE_LABEL = "Scale";

const CREATE_MAX_X = 7;
const CREATE_MAX_Y = 7;
const CREATE_MIN_Z = 7;
const CREATE_MAX_Z = 30;
const CREATE_MIN_ROT = 0;
const CREATE_MAX_ROT = Math.PI * 2 - .1;
const DEFAULT_CREATE_ROT = new Vector3(1.36, 6.75, 1.3)
const DEFAULT_CREATE_POS = new Vector3(0, 0, 3.5);

const DEFAULT_FOV = 60;
const MAX_FOV = 120;
const MIN_FOV = 30;
const FOV_STEP = 1;

const DEFAULT_RESOLUTION_SCALE = 1.0;
const MIN_RESOLUTION_SCALE = 0.25;
const MAX_RESOLUTION_SCALE = 1.0;
const RESOLUTION_SCALE_STEP = 0.05;

const DEFAULT_FOG_COLOR = "#000000";
const MIN_FOG_DISTANCE = 0;
const MAX_FOG_DISTANCE = 100;
const FOG_DISTANCE_STEP = 1;

const DEFAULT_BLOOM_COLOR = "#ffffff";
const DEFAULT_BLOOM_BLUR = 5;
const MIN_BLOOM_BLUR = 1;
const MAX_BLOOM_BLUR = 50;
const BLOOM_BLUR_STEP = 1;

//const MONKEY_MESH_PATH_INDEX = 0; // Monkey
/* Version including the monkey model.
const MESH_PATHS = {
    Monkey: "../../meshes/monkey.obj",
    Cube: "../../meshes/cube.obj",
    Cone: "../../meshes/cone.obj",
    Sphere: "../../meshes/sphere.obj",
    "Ico Sphere": "../../meshes/ico-sphere.obj",
    Torus: "../../meshes/torus.obj",
};
 */

const MESH_PATHS = {
    Cube: "../../meshes/cube.obj",
    Cone: "../../meshes/cone.obj",
    Sphere: "../../meshes/sphere.obj",
    "Ico Sphere": "../../meshes/ico-sphere.obj",
    Torus: "../../meshes/torus.obj",
};

// endregion

// region Demo Scene Setup Helpers

/**
 * Creates a scene object with specified mesh, position, rotation, and material settings.
 * @param {Engine} engine - The engine instance
 * @param {string} meshName - Name of the mesh (e.g. "Cube", "Sphere")
 * @param {Object} options - Configuration options
 * @param {Vector3} [options.position] - Position in 3D space (default: Vector3(0, 0, 10))
 * @param {Vector3} [options.rotation] - Rotation in radians (default: Vector3(0, 0, 0))
 * @param {Vector3} [options.scale] - Scale factors (default: Vector3(1, 1, 1))
 * @param {string} [options.edgeColor] - Edge color in hex format (default: SCENE_OBJ_DEFAULT_EDGE_COLOR)
 * @param {string} [options.edgeGradientColor] - Edge gradient color in hex format (default: null)
 * @param {string} [options.faceColor] - Face color in hex format (default: null)
 * @returns {Promise<SceneObject>} The created scene object
 */
async function createDemoSceneObject(engine, meshName, options = {}) {
    const {
        position = new Vector3(0, 0, 10),
        rotation = new Vector3(0, 0, 0),
        scale = Vector3.one(),
        edgeColor = SCENE_OBJ_DEFAULT_EDGE_COLOR,
        edgeGradientColor = null,
        faceColor = null
    } = options;

    // Find the mesh index by name
    const meshIndex = Object.keys(MESH_PATHS).indexOf(meshName);
    if (meshIndex === -1) {
        console.error(`Mesh "${meshName}" not found. Available meshes:`, Object.keys(MESH_PATHS));
        return null;
    }

    // Create the scene object
    await createSceneObject(engine, position, rotation, meshIndex);

    // Get the newly created object
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const lastIndex = sceneObjsSelectElement.options.length - 1;
    const id = parseInt(sceneObjsSelectElement.options[lastIndex].value, 10);
    const sceneObject = engine.scene.getSceneObjectById(id);

    if (sceneObject) {
        // Apply scale
        sceneObject.transform.setScale(scale);

        // Apply material
        sceneObject.material = new Material(edgeColor, edgeGradientColor, faceColor);
    }

    return sceneObject;
}

/**
 * Creates multiple scene objects in a grid pattern.
 * @param {Engine} engine - The engine instance
 * @param {string} meshName - Name of the mesh to use for all objects
 * @param {Object} options - Configuration options
 * @param {number} [options.rows] - Number of rows (default: 3)
 * @param {number} [options.cols] - Number of columns (default: 3)
 * @param {number} [options.spacing] - Distance between objects (default: 5)
 * @param {Vector3} [options.centerPosition] - Center position of the grid (default: Vector3(0, 0, 15))
 * @param {string} [options.edgeColor] - Edge color for all objects
 * @param {string} [options.edgeGradientColor] - Edge gradient color for all objects
 * @param {string} [options.faceColor] - Face color for all objects
 * @returns {Promise<Array<SceneObject>>} Array of created scene objects
 */
async function createDemoGrid(engine, meshName, options = {}) {
    const {
        rows = 3,
        cols = 3,
        spacing = 5,
        centerPosition = new Vector3(0, 0, 15),
        edgeColor,
        edgeGradientColor,
        faceColor
    } = options;

    const objects = [];
    const startX = -(cols - 1) * spacing / 2;
    const startY = -(rows - 1) * spacing / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const position = new Vector3(
                centerPosition.x + startX + col * spacing,
                centerPosition.y + startY + row * spacing,
                centerPosition.z
            );

            const obj = await createDemoSceneObject(engine, meshName, {
                position,
                edgeColor,
                edgeGradientColor,
                faceColor
            });

            if (obj) objects.push(obj);
        }
    }

    return objects;
}

/**
 * Creates multiple scene objects in a circular pattern.
 * @param {Engine} engine - The engine instance
 * @param {string} meshName - Name of the mesh to use for all objects
 * @param {Object} options - Configuration options
 * @param {number} [options.count] - Number of objects in the circle (default: 6)
 * @param {number} [options.radius] - Radius of the circle (default: 8)
 * @param {Vector3} [options.centerPosition] - Center position of the circle (default: Vector3(0, 0, 15))
 * @param {boolean} [options.faceCenter] - Whether objects should rotate to face the center (default: true)
 * @param {string} [options.edgeColor] - Edge color for all objects
 * @param {string} [options.edgeGradientColor] - Edge gradient color for all objects
 * @param {string} [options.faceColor] - Face color for all objects
 * @returns {Promise<Array<SceneObject>>} Array of created scene objects
 */
async function createDemoCircle(engine, meshName, options = {}) {
    const {
        count = 6,
        radius = 8,
        centerPosition = new Vector3(0, 0, 15),
        faceCenter = true,
        edgeColor,
        edgeGradientColor,
        faceColor
    } = options;

    const objects = [];
    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
        const angle = i * angleStep;
        const position = new Vector3(
            centerPosition.x + Math.cos(angle) * radius,
            centerPosition.y + Math.sin(angle) * radius,
            centerPosition.z
        );

        const rotation = faceCenter
            ? new Vector3(0, angle + Math.PI / 2, 0)
            : new Vector3(0, 0, 0);

        const obj = await createDemoSceneObject(engine, meshName, {
            position,
            rotation,
            edgeColor,
            edgeGradientColor,
            faceColor
        });

        if (obj) objects.push(obj);
    }

    return objects;
}

/**
 * Applies random positions within specified bounds to a scene object.
 * @param {SceneObject} sceneObject - The scene object to randomize
 * @param {Object} bounds - Position bounds
 * @param {Object} [bounds.x] - X axis bounds (default: {min: -10, max: 10})
 * @param {Object} [bounds.y] - Y axis bounds (default: {min: -10, max: 10})
 * @param {Object} [bounds.z] - Z axis bounds (default: {min: 10, max: 30})
 */
function applyRandomPosition(sceneObject, bounds = {}) {
    const {
        x = { min: -10, max: 10 },
        y = { min: -10, max: 10 },
        z = { min: 10, max: 30 }
    } = bounds;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const position = new Vector3(
        randomInRange(x.min, x.max),
        randomInRange(y.min, y.max),
        randomInRange(z.min, z.max)
    );

    sceneObject.transform.setPosition(position);
}

/**
 * Applies random rotation to a scene object.
 * @param {SceneObject} sceneObject - The scene object to randomize
 * @param {Object} bounds - Rotation bounds in radians
 * @param {Object} [bounds.x] - X axis rotation bounds (default: {min: 0, max: Math.PI * 2})
 * @param {Object} [bounds.y] - Y axis rotation bounds (default: {min: 0, max: Math.PI * 2})
 * @param {Object} [bounds.z] - Z axis rotation bounds (default: {min: 0, max: Math.PI * 2})
 */
function applyRandomRotation(sceneObject, bounds = {}) {
    const {
        x = { min: 0, max: Math.PI * 2 },
        y = { min: 0, max: Math.PI * 2 },
        z = { min: 0, max: Math.PI * 2 }
    } = bounds;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const rotation = new Vector3(
        randomInRange(x.min, x.max),
        randomInRange(y.min, y.max),
        randomInRange(z.min, z.max)
    );

    sceneObject.transform.setRotation(rotation);
}

/**
 * Creates a preset demo scene with multiple objects.
 * @param {Engine} engine - The engine instance
 * @param {string} presetName - Name of the preset ("grid", "circle", "showcase", "random")
 * @param {boolean} [isClear=false] - Whether to clear existing objects before creating new ones (default: false)
 * @returns {Promise<Array<SceneObject>>} Array of created scene objects
 */
async function loadDemoPreset(engine, presetName, isClear = false) {
    // Clear existing objects first
    if (isClear)
        clearSceneObjects(engine);

    const objects = [];

    switch (presetName) {
        case "grid":
            return await createDemoGrid(engine, "Cube", {
                rows: 3,
                cols: 3,
                spacing: 6,
                centerPosition: new Vector3(0, 0, 30),
                edgeColor: "#03b370",
                faceColor: "#818181"
            });

        case "circle":
            return await createDemoCircle(engine, "Cone", {
                count: 8,
                radius: 10,
                centerPosition: new Vector3(0, 0, 20),
                faceCenter: true,
                edgeColor: "#ff00ff",
                edgeGradientColor: "#00ffff"
            });

        case "showcase":
            // Create one of each mesh type in a line
            const meshNames = Object.keys(MESH_PATHS);
            const spacing = 8;
            const startX = -(meshNames.length - 1) * spacing / 2;

            for (let i = 0; i < meshNames.length; i++) {
                const obj = await createDemoSceneObject(engine, meshNames[i], {
                    position: new Vector3(startX + i * spacing, 0, 20),
                    rotation: new Vector3(0, Math.PI / 4, 0),
                    edgeColor: "#ffffff"
                });
                if (obj) objects.push(obj);
            }
            return objects;

        case "random":
            // Create random objects at random positions
            const meshNames2 = Object.keys(MESH_PATHS);
            for (let i = 0; i < 10; i++) {
                const randomMesh = meshNames2[Math.floor(Math.random() * meshNames2.length)];
                const obj = await createDemoSceneObject(engine, randomMesh, {
                    position: new Vector3(
                        Math.random() * 20 - 10,
                        Math.random() * 20 - 10,
                        Math.random() * 20 + 10
                    ),
                    rotation: new Vector3(
                        Math.random() * Math.PI * 2,
                        Math.random() * Math.PI * 2,
                        Math.random() * Math.PI * 2
                    ),
                    edgeColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
                });
                if (obj) objects.push(obj);
            }
            return objects;

        default:
            console.error(`Unknown preset: ${presetName}`);
            return objects;
    }
}

// endregion

// region Add/Remove SceneObjects Functions

function getUniqueName(baseName) {
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const existingNames = new Set();

    // Collect all existing names
    for (let i = 0; i < sceneObjsSelectElement.options.length; i++)
        existingNames.add(sceneObjsSelectElement.options[i].text);

    // If the base name is unique, use it as-is
    if (!existingNames.has(baseName))
        return baseName;


    // Otherwise, find the next available number
    let counter = 1;
    let uniqueName;
    do {
        uniqueName = `${baseName} (${counter})`;
        counter++;
    } while (existingNames.has(uniqueName));

    return uniqueName;
}

async function createSceneObject(engine, posOverride = null, rotOverride = null, meshIndexOverride = -1) {
    // The select element where the user picks from a limited list of predefined meshes
    const meshSelectElement = document.getElementById(CREATE_SCENE_OBJ_MESH_SELECT_ID);

    // Use meshIndexOverride if provided (>= 0), otherwise use currently selected index
    const meshIndex = meshIndexOverride >= 0 ? meshIndexOverride : meshSelectElement.selectedIndex;
    const objFileUrl = meshSelectElement.options[meshIndex].value;
    const baseName = meshSelectElement.options[meshIndex].text;
    const displayName = getUniqueName(baseName);

    let mesh;
    if (meshCache.has(objFileUrl)) {
        mesh = meshCache.get(objFileUrl);
    } else {
        mesh = await WavefrontMeshConverter.fromUrl(objFileUrl);
        meshCache.set(objFileUrl, mesh);
    }

    let spawnPos;
    let spawnRot ;

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Use posOverride if provided, otherwise use default logic
    if (posOverride !== null) {
        spawnPos = posOverride;
    } else if (engine.scene.sceneObjects.length > 0) {
        spawnPos = new Vector3(
            randomInt(-CREATE_MAX_X, CREATE_MAX_X),
            randomInt(-CREATE_MAX_Y, CREATE_MAX_Y),
            randomInt(CREATE_MIN_Z, CREATE_MAX_Z)
        );
    } else {
        spawnPos = DEFAULT_CREATE_POS;
    }

    // Use rotOverride if provided, otherwise use default logic
    if (rotOverride !== null) {
        spawnRot = rotOverride;
    } else if (engine.scene.sceneObjects.length > 0) {
        spawnRot = new Vector3(
            randomInt(CREATE_MIN_ROT, CREATE_MAX_ROT),
            randomInt(CREATE_MIN_ROT, CREATE_MAX_ROT),
            randomInt(CREATE_MIN_ROT, CREATE_MAX_ROT)
        );
    } else {
        spawnRot = DEFAULT_CREATE_ROT;
    }

    const sceneObject = new SceneObject(mesh, new Transform(spawnPos, spawnRot, Vector3.one()), new Material(SCENE_OBJ_DEFAULT_EDGE_COLOR));
    const id = engine.scene.addSceneObject(sceneObject);

    // The select element that's used to display the list of current scene objects
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    sceneObjsSelectElement.appendChild(new Option(displayName, id));

    // Select the newly created scene object
    sceneObjsSelectElement.selectedIndex = sceneObjsSelectElement.options.length - 1;

    updateInspectorClearButtonState(engine);
    updateInspectorRemoveButtonState();
    updateSelectedObjectControls(engine);
}

function removeSceneObject(engine) {
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const selectedIndex = sceneObjsSelectElement.selectedIndex;
    if (selectedIndex === -1) return;

    const id = parseInt(sceneObjsSelectElement.value, 10);
    const sceneObject = engine.scene.getSceneObjectById(id);
    engine.scene.removeSceneObject(sceneObject);
    sceneObjsSelectElement.remove(selectedIndex);

    // Select the next closest scene object if any remain
    if (sceneObjsSelectElement.options.length > 0) {
        // If the removed item was the last one, select the new last item
        // Otherwise, select the item at the same index (which is now the next item)
        if (selectedIndex >= sceneObjsSelectElement.options.length)
            sceneObjsSelectElement.selectedIndex = sceneObjsSelectElement.options.length - 1;
        else
            sceneObjsSelectElement.selectedIndex = selectedIndex;
    }

    updateInspectorClearButtonState(engine);
    updateInspectorRemoveButtonState();
    updateSelectedObjectControls(engine);
}

function clearSceneObjects(engine) {
    const sceneObjects = engine.scene.sceneObjects;
    for (const sceneObject of sceneObjects)
        engine.scene.removeSceneObject(sceneObject);

    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    sceneObjsSelectElement.innerHTML = '';

    selSceneObjectId = null;
    updateInspectorClearButtonState(engine);
    updateInspectorRemoveButtonState();
    updateSelectedObjectControls(engine);
}

// endregion

// region Create Settings Templates

/**
 * Creates a checkbox settings input from the template and adds it to a parent element.
 * @param {string} title - The label text to display next to the checkbox
 * @param {HTMLElement} parentElement - The element to append the checkbox to
 * @param {function} onChange - Callback function that receives the checkbox checked state (boolean)
 * @param {boolean} initialChecked - Initial checked state (default: false)
 * @param {null} uniqueId - Optional unique ID for the checkbox (auto-generated if not provided)
 * @returns {HTMLInputElement} The created checkbox input element
 */
function createSettingsCheckbox(title, parentElement, onChange, initialChecked = false, uniqueId = null) {
    const template = document.getElementById(SETTINGS_INPUT_CHECKBOX_TEMPLATE_ID);
    const clone = template.content.cloneNode(true);

    const checkbox = clone.querySelector('input[type="checkbox"]');
    const label = clone.querySelector('h4');

    // Set the label text
    label.textContent = title;

    // Set unique ID (generate from title if not provided)
    checkbox.id = uniqueId || `${makeDomSafeKey(title)}-checkbox`;

    // Set initial checked state
    checkbox.checked = initialChecked;

    // Wire change event if callback provided
    if (typeof onChange === "function")
        checkbox.addEventListener("change", (event) => {
            onChange(event.target.checked);
        });


    // Append to parent
    parentElement.appendChild(clone);

    // Call the onChange callback with initial-value after setup is complete
    if (typeof onChange === "function")
        onChange(initialChecked);

    return checkbox;
}

/**
 * Creates a slider settings input from the template and adds it to a parent element.
 * @param {string} title - The label text to display for the slider
 * @param {HTMLElement} parentElement - The element to append the slider to
 * @param {function} onChange - Callback function that receives the slider value (number)
 * @param {number} min - Minimum slider value (default: 0)
 * @param {number} max - Maximum slider value (default: 100)
 * @param {number} step - Step increment (default: 1)
 * @param {null} initialValue - Initial slider value (default: min value)
 * @param {null} uniqueId - Optional unique ID for the slider (auto-generated if not provided)
 * @returns {HTMLInputElement} The created slider input element
 */
function createSettingsSlider(title, parentElement, onChange, min = 0, max = 100, step = 1, initialValue = null, uniqueId = null) {
    const template = document.getElementById(SETTINGS_INPUT_SLIDER_TEMPLATE_ID);
    const clone = template.content.cloneNode(true);

    const slider = clone.querySelector('.slider-input');
    const label = clone.querySelector('.slider-label');
    const valueDisplay = clone.querySelector('.slider-value');

    // Set the label text
    label.textContent = title;

    // Set unique ID (generate from title if not provided)
    slider.id = uniqueId || `${makeDomSafeKey(title)}-slider`;

    // Set slider range and step
    slider.min = min;
    slider.max = max;
    slider.step = step;

    // Set initial-value (default to min if not provided)
    const startValue = initialValue !== null ? initialValue : min;
    slider.value = startValue;
    valueDisplay.textContent = startValue;

    // Wire input event to update display and call callback
    slider.addEventListener("input", (event) => {
        const value = parseFloat(event.target.value);
        valueDisplay.textContent = value;
        if (typeof onChange === "function") {
            onChange(value);
        }
    });

    // Append to parent
    parentElement.appendChild(clone);

    // Call the onChange callback with initial value after setup is complete
    if (typeof onChange === "function")
        onChange(startValue);

    return slider;
}

/**
 * Creates a color picker input from the template and adds it to a parent element.
 * @param {string} title - The label text to display for the color picker
 * @param {HTMLElement} parentElement - The element to append the color picker to
 * @param {function} onChange - Callback function that receives the color value (string, hex format like "#ff0000")
 * @param {string} initialColor - Initial color value in hex format (default: "#000000")
 * @param {null} uniqueId - Optional unique ID for the color picker (auto-generated if not provided)
 * @returns {HTMLInputElement} The created color input element
 */
function createSettingsColor(title, parentElement, onChange, initialColor = "#000000", uniqueId = null) {
    const template = document.getElementById(SETTINGS_INPUT_COLOR_TEMPLATE_ID);
    const clone = template.content.cloneNode(true);
    const container = clone.firstElementChild;

    const colorInput = clone.querySelector('.color-input');
    const label = clone.querySelector('.color-label');

    // Set the label text
    label.textContent = title;

    // Set unique ID (generate from title if not provided)
    colorInput.id = uniqueId || `${makeDomSafeKey(title)}-color`;

    // Set initial color
    colorInput.value = initialColor;

    // Wire input event to call callback
    colorInput.addEventListener("input", (event) => {
        if (typeof onChange === "function") {
            onChange(event.target.value);
        }
    });

    // Append to parent
    parentElement.appendChild(container);

    // Call the onChange callback with initial value after setup is complete
    if (typeof onChange === "function") {
        onChange(initialColor);
    }

    return container;
}

/**
 * Creates a gradient color picker input from the template and adds it to a parent element.
 * @param {string} title - The label text to display for the gradient picker
 * @param {HTMLElement} parentElement - The element to append the gradient picker to
 * @param {function} onChange - Callback function that receives an object with startColor and endColor (e.g.,
 *     {startColor: "#ff0000", endColor: "#0000ff"})
 * @param {string} initialStartColor - Initial start color value in hex format (default: "#000000")
 * @param {string} initialEndColor - Initial end color value in hex format (default: "#ffffff")
 * @param {null} uniqueId - Optional unique ID prefix for the gradient picker inputs (auto-generated if not provided)
 * @returns {Object} Object containing {startInput, endInput} - the created color input elements
 */
function createSettingsGradient(title, parentElement, onChange, initialStartColor = "#000000", initialEndColor = "#ffffff", uniqueId = null) {
    const template = document.getElementById(SETTINGS_INPUT_GRADIENT_TEMPLATE_ID);
    const clone = template.content.cloneNode(true);
    const container = clone.firstElementChild;

    const startInput = clone.querySelector('.gradient-start-input');
    const endInput = clone.querySelector('.gradient-end-input');
    const label = clone.querySelector('.gradient-label');

    // Set the label text
    label.textContent = title;

    // Set unique IDs (generate from title if not provided)
    const gradientIdPrefix = uniqueId || `${makeDomSafeKey(title)}-gradient`;
    startInput.id = `${gradientIdPrefix}-start`;
    endInput.id = `${gradientIdPrefix}-end`;

    // Set initial colors
    startInput.value = initialStartColor;
    endInput.value = initialEndColor;

    // Wire input events to call callback with both colors
    const emitChange = () => {
        if (typeof onChange === "function") {
            onChange({
                startColor: startInput.value,
                endColor: endInput.value
            });
        }
    };

    startInput.addEventListener("input", emitChange);
    endInput.addEventListener("input", emitChange);

    // Append to parent
    parentElement.appendChild(container);

    // Call the onChange callback with initial values after setup is complete
    if (typeof onChange === "function") {
        onChange({
            startColor: initialStartColor,
            endColor: initialEndColor
        });
    }

    return container;
}

// endregion

// region SceneObject Selection Functions

function updateSelectedObjectControls(engine) {
    updateInspectorRemoveButtonState();

    // Remove existing controls if they exist
    const existingPanel = document.getElementById(SELECTED_OBJ_TRANSFORM_PANEL_ID);
    if (existingPanel) {
        existingPanel.remove();
    }

    // Get the selected scene object
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const selectedIndex = sceneObjsSelectElement.selectedIndex;

    // If nothing is selected or no objects exist, return
    if (selectedIndex === -1 || sceneObjsSelectElement.options.length === 0)
        return;

    // Get the selected scene object by ID
    selSceneObjectId = parseInt(sceneObjsSelectElement.value, 10);
    const sceneObject = engine.scene.getSceneObjectById(selSceneObjectId);

    if (!sceneObject)
        return;

    // Get the display name from the select option
    const displayName = sceneObjsSelectElement.options[selectedIndex].text;

    // Add transform controls for the selected object
    // Insert after the scene objects panel (index 1)
    const controlSubpanel = createTransformSettings(
        `Selected "${displayName}"`,
        sceneObject.transform,
        true,  // isPos
        !doesRotateSelSceneObj,  // isRot
        true,  // isScale
        1,     // childIndex - insert after scene objects panel
        SELECTED_OBJ_TRANSFORM_PANEL_ID  // panelId
    );

    // Edge color/gradient controls (create pickers first to get references, then reorder DOM)
    const isGradient = sceneObject.material.isEdgeGradient;

    const gradientSettings = createSettingsGradient(
        "Edge Gradient",
        controlSubpanel,
        (gradient) => {
            sceneObject.material = new Material(gradient.startColor, gradient.endColor, sceneObject.material.faceColor);
        },
        sceneObject.material.originalEdgeColor || SCENE_OBJ_DEFAULT_EDGE_COLOR,
        sceneObject.material.originalEdgeGradientColor || SCENE_OBJ_DEFAULT_EDGE_COLOR
    );

    const colorSettings = createSettingsColor(
        "Edge Color",
        controlSubpanel,
        (color) => {
            sceneObject.material = new Material(color, null, sceneObject.material.faceColor);
        },
        sceneObject.material.originalEdgeColor || SCENE_OBJ_DEFAULT_EDGE_COLOR
    );



    createSettingsCheckbox(
        "Use Edge Gradient",
        controlSubpanel,
        (useGradient) => {
            if (useGradient) {
                const startColor = gradientSettings.querySelector('.gradient-start-input').value;
                const endColor = gradientSettings.querySelector('.gradient-end-input').value;

                sceneObject.material = new Material(startColor, endColor, sceneObject.material.faceColor);
                colorSettings.style.display = 'none';
                gradientSettings.style.display = 'flex';
            }
            else {
                const color = colorSettings.querySelector('.color-input').value;
                sceneObject.material = new Material(color, null, sceneObject.material.faceColor);
                colorSettings.style.display = 'flex';
                gradientSettings.style.display = 'none';
            }
        },
        isGradient
    );

    // Reorder DOM: move checkbox before color pickers
    const edgeGradientCheckbox = controlSubpanel.lastElementChild;
    controlSubpanel.insertBefore(edgeGradientCheckbox, colorSettings);

    // Face color controls
    const isFaceColor = sceneObject.material.isFaceColor;

    const faceColorSettings = createSettingsColor(
        "Face Color",
        controlSubpanel,
        (color) => {
            const currentEdgeColor = sceneObject.material.edgeColor;
            const currentEdgeGradientColor = sceneObject.material.edgeGradientColor;
            sceneObject.material = new Material(currentEdgeColor, currentEdgeGradientColor, color);
        },
        sceneObject.material.originalFaceColor || SCENE_OBJ_DEFAULT_FACE_COLOR
    );

    createSettingsCheckbox(
        "Use Face Color",
        controlSubpanel,
        (useFaceColor) => {
            if (useFaceColor) {
                const currentEdgeColor = sceneObject.material.edgeColor;
                const currentEdgeGradientColor = sceneObject.material.edgeGradientColor;
                const faceColor = faceColorSettings.querySelector('.color-input').value;
                sceneObject.material = new Material(currentEdgeColor, currentEdgeGradientColor, faceColor);
                faceColorSettings.style.display = 'flex';
            }
            else {
                const currentEdgeColor = sceneObject.material.edgeColor;
                const currentEdgeGradientColor = sceneObject.material.edgeGradientColor;
                sceneObject.material = new Material(currentEdgeColor, currentEdgeGradientColor, null);
                faceColorSettings.style.display = 'none';
            }
        },
        isFaceColor
    );

    // Reorder DOM: move checkbox before face color picker
    const faceColorCheckbox = controlSubpanel.lastElementChild;
    controlSubpanel.insertBefore(faceColorCheckbox, faceColorSettings);
}

function updateInspectorClearButtonState(engine) {
    const clearButton = document.getElementById(CLEAR_SCENE_OBJS_BTN_ID);
    const hasSceneObjects = engine.scene.sceneObjects.length > 0;
    clearButton.disabled = !hasSceneObjects;
}

function updateInspectorRemoveButtonState() {
    const removeButton = document.getElementById(REMOVE_SCENE_OBJ_BTN_ID);
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const hasSelection = sceneObjsSelectElement.selectedIndex !== -1;
    const hasSceneObjects = sceneObjsSelectElement.options.length > 0;
    removeButton.disabled = !hasSelection || !hasSceneObjects;
}

// endregion

// region Transform Settings Functions

function createTransformSettings(
    transformName,
    transform,
    isPos = true,
    isRot = true,
    isScale = true,
    childIndex = null,
    panelId = null
) {
    // The template contains a single div element with a header element child
    const template = document.getElementById(TRANSFORM_SETTINGS_TEMPLATE_ID);
    const subpanel = template.content.cloneNode(true).firstElementChild;
    subpanel.firstElementChild.textContent = transformName;

    // Set custom ID if provided
    if (panelId) {
        subpanel.id = panelId;
    }

    // Use a unique prefix per panel to avoid duplicate IDs like "posX" etc.
    // Example: "Camera" => "camera", "My Obj" => "my-obj"
    const panelKey = makeDomSafeKey(transformName);

    if (isPos)
        addVectorInput(
            subpanel,
            `${panelKey}-${POS_PREFIX}`,   // unique prefix
            POS_INC,
            POS_LABEL,
            (pos) => {
                transform.setPosition(pos);
            },
            transform.position
        );


    if (isRot)
        addVectorInput(
            subpanel,
            `${panelKey}-${ROT_PREFIX}`,
            ROT_INC,
            ROT_LABEL,
            (rot) => {
                transform.setRotation(rot);
            },
            transform.rotation
        );


    if (isScale)
        addVectorInput(
            subpanel,
            `${panelKey}-${SCALE_PREFIX}`,
            SCALE_INC,
            SCALE_LABEL,
            (scale) => {
                transform.setScale(scale);
            },
            transform.scale
        );


    const inspectorPanel = document.getElementById(INSPECTOR_PANEL_ID);

    // If childIndex is specified and valid, insert at that position
    if (childIndex !== null && childIndex >= 0 && childIndex < inspectorPanel.children.length) {
        inspectorPanel.insertBefore(subpanel, inspectorPanel.children[childIndex]);
    } else {
        // Otherwise append to the end
        inspectorPanel.appendChild(subpanel);
    }

    return subpanel;
}

/**
 * Adds a vector input (label + 3 number inputs) and optionally wires onChange(Vector3).
 * - prefix should be UNIQUE within the document (we build this from transformName + type).
 * - onChange is called whenever any component changes, passing the full Vector3.
 */
function addVectorInput(parentElement, prefix, step, labelText, onChange, initialValue = null) {
    const template = document.getElementById(VECTOR_INPUT_TEMPLATE_ID);
    const clone = template.content.cloneNode(true);

    const vectorLabel = clone.querySelector(".vector-label");
    const x = clone.querySelector(".x");
    const y = clone.querySelector(".y");
    const z = clone.querySelector(".z");

    vectorLabel.textContent = labelText;

    // Unique IDs (important if you add multiple transform panels)
    x.id = `${prefix}X`;
    y.id = `${prefix}Y`;
    z.id = `${prefix}Z`;

    // Set initial values if provided
    if (initialValue !== null) {
        x.value = initialValue.x;
        y.value = initialValue.y;
        z.value = initialValue.z;
    }

    if (typeof step === "number" && step > 0) {
        x.step = step;
        y.step = step;
        z.step = step;
    } else {
        x.removeAttribute("step");
        y.removeAttribute("step");
        z.removeAttribute("step");
    }

    // Wire change events if a callback was provided
    if (typeof onChange === "function") {
        const emit = () => {
            const v = readVector3FromInputs(x, y, z);
            onChange(v);
        };

        // "input" fires immediately while typing; "change" fires on blur/enter.
        x.addEventListener("input", emit);
        y.addEventListener("input", emit);
        z.addEventListener("input", emit);
    }

    parentElement.appendChild(clone);
}

function readVector3FromInputs(xEl, yEl, zEl) {
    // Number inputs return "" when empty; treat as 0 instead of NaN.
    const x = parseFloat(xEl.value);
    const y = parseFloat(yEl.value);
    const z = parseFloat(zEl.value);

    return new Vector3(
        Number.isFinite(x) ? x : 0,
        Number.isFinite(y) ? y : 0,
        Number.isFinite(z) ? z : 0
    );
}

function makeDomSafeKey(text) {
    return String(text)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-_]/g, "");
}

// endregion

// region Inspector Initialization Functions

function initInspectorListeners(engine) {
    document.getElementById(CREATE_SCENE_OBJ_BTN_ID).addEventListener("click", () => createSceneObject(engine));
    document.getElementById(REMOVE_SCENE_OBJ_BTN_ID).addEventListener("click", () => removeSceneObject(engine));
    document.getElementById(CLEAR_SCENE_OBJS_BTN_ID).addEventListener("click", () => clearSceneObjects(engine));
    document.getElementById(SCENE_OBJS_SELECT_ID).addEventListener("change", () => {
        updateSelectedObjectControls(engine);
    });
    window.addEventListener("resize", () => updateToBrowserSize(engine));
}

function initInspector(engine) {
    addOptionsToMeshSelect();
    initInspectorListeners(engine);
    updateInspectorClearButtonState(engine);
    updateInspectorRemoveButtonState();

    // ========== Rendering Panel ==========
    const renderingPanel = document.getElementById("rendering-panel");

    createSettingsCheckbox(
        "Depth Sorting",
        renderingPanel,
        (checked) => {
            engine.isDepthSorting = checked;
        },
        true // initially checked
    );

    createSettingsCheckbox(
        "Back Face Culling",
        renderingPanel,
        (checked) => {
            engine.camera.isBackFaceCulling = checked;
        },
        true // initially checked
    );

    createSettingsSlider(
        "Resolution Scale",
        renderingPanel,
        (value) => {
            resolutionScale = value;
            updateToBrowserSize(engine);
        },
        MIN_RESOLUTION_SCALE,
        MAX_RESOLUTION_SCALE,
        RESOLUTION_SCALE_STEP,
        DEFAULT_RESOLUTION_SCALE
    );

    // ========== Animation Panel ==========
    const animationPanel = document.getElementById("animation-panel");

    createSettingsCheckbox(
        "Rotate Selected Scene Object",
        animationPanel,
        (checked) => {
            doesRotateSelSceneObj = checked;
            updateSelectedObjectControls(engine);
        },
        true
    );

    createSettingsSlider(
        "Rotation Speed",
        animationPanel,
        (value) => {
            selSceneObjectRotationSpeed = value;
        },
        SELECTED_OBJ_MIN_ROTATE_SPEED,
        SELECTED_OBJ_MAX_ROTATE_SPEED,
        SELECTED_OBJ_ROTATE_SPEED_SLIDER_INC,
        DEFAULT_SELECTED_OBJ_ROTATE_SPEED
    );

    // ========== Background Panel ==========
    const backgroundPanel = document.getElementById("background-panel");

    const bgColorSettings = createSettingsColor(
        "Background Color",
        backgroundPanel,
        (color) => {
            engine.backgroundColor = color;
        },
        engine.backgroundColor || DEFAULT_BACKGROUND_COLOR
    );

    const bgGradientSettings = createSettingsGradient(
        "Background Gradient",
        backgroundPanel,
        (gradient) => {
            engine.backgroundColor = gradient.startColor;
            engine.backgroundGradientColor = gradient.endColor;
        },
        engine.backgroundColor || DEFAULT_BACKGROUND_COLOR,
        engine.backgroundGradientColor || DEFAULT_BACKGROUND_GRADIENT_COLOR
    );

    createSettingsCheckbox(
        "Use Background Gradient",
        backgroundPanel,
        (useGradient) => {
            if (useGradient) {
                const startColor = bgGradientSettings.querySelector('.gradient-start-input').value;
                const endColor = bgGradientSettings.querySelector('.gradient-end-input').value;
                engine.backgroundColor = startColor;
                engine.backgroundGradientColor = endColor;
                bgColorSettings.style.display = 'none';
                bgGradientSettings.style.display = 'flex';
            }
            else {
                engine.backgroundColor = bgColorSettings.querySelector('.color-input').value;
                engine.backgroundGradientColor = null;
                bgColorSettings.style.display = 'flex';
                bgGradientSettings.style.display = 'none';
            }
        },
        true
    );

    const bgGradientCheckbox = backgroundPanel.lastElementChild;
    backgroundPanel.insertBefore(bgGradientCheckbox, bgColorSettings);

    // ========== Fog Panel ==========
    const fogPanel = document.getElementById("fog-panel");
    const fogSettings = engine.depthFog;

    const fogColorSettings = createSettingsColor(
        "Fog Color",
        fogPanel,
        (color) => {
            engine.depthFog = { color };
        },
        fogSettings.color || DEFAULT_FOG_COLOR
    );

    const fogNearSlider = createSettingsSlider(
        "Fog Near",
        fogPanel,
        (value) => {
            engine.depthFog = { near: value };
        },
        MIN_FOG_DISTANCE,
        MAX_FOG_DISTANCE,
        FOG_DISTANCE_STEP,
        fogSettings.near
    );

    const fogFarSlider = createSettingsSlider(
        "Fog Far",
        fogPanel,
        (value) => {
            engine.depthFog = { far: value };
        },
        MIN_FOG_DISTANCE,
        MAX_FOG_DISTANCE,
        FOG_DISTANCE_STEP,
        fogSettings.far
    );

    createSettingsCheckbox(
        "Enable Fog",
        fogPanel,
        (enabled) => {
            engine.depthFog = { enabled };
            if (enabled) {
                fogColorSettings.style.display = 'flex';
                fogNearSlider.parentElement.style.display = 'flex';
                fogFarSlider.parentElement.style.display = 'flex';
            } else {
                fogColorSettings.style.display = 'none';
                fogNearSlider.parentElement.style.display = 'none';
                fogFarSlider.parentElement.style.display = 'none';
            }
        },
        fogSettings.enabled
    );

    const fogCheckbox = fogPanel.lastElementChild;
    fogPanel.insertBefore(fogCheckbox, fogColorSettings);

    // ========== Bloom Panel ==========
    const bloomPanel = document.getElementById("bloom-panel");
    const bloomSettings = engine.bloom;

    const bloomColorSettings = createSettingsColor(
        "Bloom Color",
        bloomPanel,
        (color) => {
            engine.bloom = { color };
        },
        bloomSettings.color || DEFAULT_BLOOM_COLOR
    );

    const bloomBlurSlider = createSettingsSlider(
        "Bloom Blur",
        bloomPanel,
        (value) => {
            engine.bloom = { blur: value };
        },
        MIN_BLOOM_BLUR,
        MAX_BLOOM_BLUR,
        BLOOM_BLUR_STEP,
        DEFAULT_BLOOM_BLUR
    );

    const bloomUseEdgeColorCheckbox = createSettingsCheckbox(
        "Use Edge Color for Bloom",
        bloomPanel,
        (useEdgeColor) => {
            if (useEdgeColor) {
                engine.bloom = { color: null };
                bloomColorSettings.style.display = 'none';
            } else {
                const color = bloomColorSettings.querySelector('.color-input').value;
                engine.bloom = { color };
                bloomColorSettings.style.display = 'flex';
            }
        },
        bloomSettings.color === null
    );

    // Reorder DOM: move checkbox before bloom color picker
    const bloomUseEdgeColorContainer = bloomUseEdgeColorCheckbox.parentElement;
    bloomPanel.insertBefore(bloomUseEdgeColorContainer, bloomColorSettings);

    const bloomEnableCheckbox = createSettingsCheckbox(
        "Enable Bloom",
        bloomPanel,
        (enabled) => {
            engine.bloom = { enabled };
            if (enabled) {
                bloomColorSettings.style.display = bloomSettings.color === null ? 'none' : 'flex';
                bloomUseEdgeColorContainer.style.display = 'flex';
                bloomBlurSlider.parentElement.style.display = 'flex';
            } else {
                bloomColorSettings.style.display = 'none';
                bloomUseEdgeColorContainer.style.display = 'none';
                bloomBlurSlider.parentElement.style.display = 'none';
            }
        },
        bloomSettings.enabled
    );

    const bloomEnableContainer = bloomEnableCheckbox.parentElement;
    bloomPanel.insertBefore(bloomEnableContainer, bloomUseEdgeColorContainer);

    // ========== Camera Panel (at the bottom) ==========
    // Add camera transform controls at the bottom of the inspector panel
    const cameraPanel = createTransformSettings(
        "Camera",
        engine.camera.transform,
        true, // isPos
        true, // isRot
        false, // isScale - disable scale for camera
        null // childIndex - append to the end
    );

    // Add FOV slider to the camera panel
    createSettingsSlider(
        "Field of View",
        cameraPanel,
        (value) => {
            engine.camera.setFov(value);
        },
        MIN_FOV,
        MAX_FOV,
        FOV_STEP,
        DEFAULT_FOV
    );
}

function addOptionsToMeshSelect() {
    const meshSelectElement = document.getElementById(CREATE_SCENE_OBJ_MESH_SELECT_ID);
    for (const [key, value] of Object.entries(MESH_PATHS)) {
        meshSelectElement.appendChild(new Option(key, value));
    }
}

// endregion

function updateToBrowserSize(engine) {
    const body = document.body;

    isMobile = body.clientWidth <= MOBILE_WIDTH_THRESHOLD;
    const inspector = document.getElementById(INSPECTOR_PANEL_ID);
    const viewport = document.getElementById(VIEWPORT_PANEL_ID);

    let baseRenderWidth;
    let baseRenderHeight = null;

    if (isMobile) {
        body.style.flexDirection = "column-reverse";

        inspector.style.width = "100%";
        inspector.style.maxHeight = MOBILE_INSPECTOR_HEIGHT + "px";
        inspector.style.overflowY = "auto";

        baseRenderWidth = body.clientWidth;
        baseRenderHeight = body.clientHeight - MOBILE_INSPECTOR_HEIGHT;
    } else {
        body.style.flexDirection = "row";

        inspector.style.width = DESKTOP_INSPECTOR_WIDTH + "px";
        inspector.style.maxHeight = viewport.clientHeight + "px";
        inspector.style.overflowY = "auto";

        baseRenderWidth = body.clientWidth - DESKTOP_INSPECTOR_WIDTH;
        baseRenderHeight = viewport.clientHeight;
    }

    engine.screenSize = new Vector2(
        Math.floor(baseRenderWidth * resolutionScale),
        Math.floor(baseRenderHeight * resolutionScale)
    );

}


async function createDemoSceneObjects(engine) {
    // Spawn a grid of cubes surrounded by cones in a circular formation.
    //await loadDemoPreset(engine, "grid");
    //await loadDemoPreset(engine, "circle")

    const demoObj = {
        position: new Vector3(4, -12, 24.5),
        rotation: new Vector3(-.26, 2.21, -2.27),
        scale: new Vector3(3.2, 1.4, 1),
        edgeColor: "#b6b6b6",
        edgeGradientColor: null,
        faceColor: null
    }

    await createDemoSceneObject(
        engine,
        "Cube",
        demoObj
    );

    demoObj.scale = Vector3.one();
    demoObj.position = new Vector3(-10, 13, 30);
    demoObj.rotation = new Vector3(-1.1, 5.761, -.25);
    demoObj.edgeColor = "#404040";

    await createDemoSceneObject(
        engine,
        "Cube",
        demoObj
    );



    demoObj.position = new Vector3(0, 13, 26);
    demoObj.rotation = new Vector3(-0.25, 2.36, -1.45);
    demoObj.scale = new Vector3(1.8, 1.8, 1.8);
    demoObj.edgeColor = "#4b7064";
    demoObj.edgeGradientColor = null;
    demoObj.faceColor = "#0f2f2c";
    await createDemoSceneObject(engine, "Cube", demoObj);

    demoObj.position = new Vector3(-11.5, -11, 29.5);
    demoObj.rotation = new Vector3(.8, -1.38, 0.32);
    demoObj.scale = new Vector3(1.7, 1.7, 1.7);
    demoObj.edgeColor = "#4f476e";
    demoObj.edgeGradientColor = null;
    demoObj.faceColor = "#1b1633";
    await createDemoSceneObject(engine, "Cube", demoObj);

    demoObj.position = new Vector3(-13.0, -2.5, 28);
    demoObj.rotation = new Vector3(-1.0, 0.55, 1.55);
    demoObj.scale = new Vector3(1.35, 1.35, 1.35);
    demoObj.edgeColor = "#37513b";
    demoObj.edgeGradientColor = "#20715a";
    demoObj.faceColor = null;
    await createDemoSceneObject(engine, "Cone", demoObj);

    demoObj.position = new Vector3(-15.5, 5.5, 34);
    demoObj.rotation = new Vector3(-.27, -25.12, -.51);
    demoObj.scale = new Vector3(4, 4, 4);
    demoObj.edgeColor = "#5d4885";
    demoObj.edgeGradientColor = null;
    demoObj.faceColor = null;
    await createDemoSceneObject(engine, "Sphere", demoObj);

    demoObj.position = new Vector3(7.5, -4.5, 18);
    demoObj.rotation = new Vector3(-0.25, 0.55, -0.45);
    demoObj.scale = new Vector3(1.4, 1.4, 1.4);
    demoObj.edgeColor = "#6c5c4d";
    demoObj.edgeGradientColor = null;
    demoObj.faceColor = "#2a1a10";
    await createDemoSceneObject(engine, "Ico Sphere", demoObj);

    demoObj.position = new Vector3(14, 8, 33.5);
    demoObj.rotation = new Vector3(2, 29.38, -.85);
    demoObj.scale = new Vector3(3, 3, 3);
    demoObj.edgeColor = "#2b876f";
    demoObj.edgeGradientColor = null;
    demoObj.faceColor = "#1a381c";
    await createDemoSceneObject(engine, "Cone", demoObj);

    demoObj.position = DEFAULT_CREATE_POS;
    demoObj.rotation = DEFAULT_CREATE_ROT;
    demoObj.scale = Vector3.one();
    demoObj.edgeColor = "#ffffff";
    demoObj.faceColor = "#000000"
    demoObj.edgeGradientColor = null;
    await createDemoSceneObject(engine, "Torus", demoObj);

    // Create a scene object in the center of the screen (created last so it's selected and rotates)
    //await createSceneObject(engine, DEFAULT_CREATE_POS, DEFAULT_CREATE_ROT, TORUS_MESH_PATH_INDEX);
}

async function init() {

    const engine = new Engine(document.getElementById("canvas"));
    engine.isFrameRateCounter = true;

    updateToBrowserSize(engine);

    initInspector(engine);

    updateInspectorRemoveButtonState();
    updateSelectedObjectControls(engine);

    engine.onFrameUpdate = (deltaTime) => {
        if (!doesRotateSelSceneObj || selSceneObjectId === null)
            return;

        const selSceneObject = engine.scene.getSceneObjectById(selSceneObjectId);

        if (selSceneObject === undefined)
            return;

        selSceneObject.transform.rotate(new Vector3(0, selSceneObjectRotationSpeed * deltaTime, 0));
    }
    await createDemoSceneObjects(engine);
    engine.start();
}

import {Engine, Material, SceneObject, Transform, Vector2, Vector3, WavefrontMeshConverter} from 'canvas-js-3d';

let isMobile = false;
let resolutionScale = DEFAULT_RESOLUTION_SCALE;
let selectedObjectOriginalColor = null;
const meshCache = new Map();
let doesRotateSelSceneObj = true;
let selSceneObjectId = null;
let selSceneObjectRotationSpeed = DEFAULT_SELECTED_OBJ_ROTATE_SPEED;
init();
