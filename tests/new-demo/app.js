// #region Constants
// ID for the selected object's transform controls
const SCENE_OBJ_DEFAULT_EDGE_COLOR = "white";
const SELECTED_OBJ_TRANSFORM_PANEL_ID = "selected-obj-transform-panel";

// The select element where the user picks from a limited list of predefined meshes
const CREATE_SCENE_OBJ_MESH_SELECT_ID = "create-scene-obj-mesh-select";

// The select element that's used to display the list of current scene objects
const SCENE_OBJS_SELECT_ID = "scene-objs-select";
const INSPECTOR_PANEL_ID = "inspector-panel";
const VIEWPORT_PANEL_ID = "viewport-panel";
const VECTOR_INPUT_TEMPLATE_ID = "vector-input-template";
const TRANSFORM_INPUTS_TEMPLATE_ID = "transform-input-template";
const CREATE_SCENE_OBJ_BTN_ID = "create-scene-obj-btn";
const REMOVE_SCENE_OBJ_BTN_ID = "remove-scene-obj-btn";
const CLEAR_SCENE_OBJS_BTN_ID = "clear-scene-objs-btn";

const OPTION_INPUT_CHECKBOX_TEMPLATE_ID = "option-input-checkbox-template";
const OPTION_INPUT_SLIDER_TEMPLATE_ID = "option-input-slider-template";
const OPTION_INPUT_COLOR_TEMPLATE_ID = "option-input-color-template";
const OPTION_INPUT_GRADIENT_TEMPLATE_ID = "option-input-gradient-template";
const OPTION_INPUT_COLOR_OR_GRADIENT_TEMPLATE_ID = "option-input-color-or-gradient-template";

const MOBILE_WIDTH_THRESHOLD = 768;
const MOBILE_INSPECTOR_HEIGHT = 300;
const DESKTOP_INSPECTOR_WIDTH = 275;

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
const DEFAULT_CREATE_Y_ROT = Math.PI + .35;
const DEFAULT_CREATE_Z_ROT = .15;
const CREATE_MIN_ROT = 0;
const CREATE_MAX_ROT = Math.PI * 2 - .1;

const DEFAULT_FOV = 60;
const MAX_FOV = 120;
const MIN_FOV = 30;
const FOV_STEP = 1;

const DEFAULT_RESOLUTION_SCALE = 1.0;
const MIN_RESOLUTION_SCALE = 0.25;
const MAX_RESOLUTION_SCALE = 1.0;
const RESOLUTION_SCALE_STEP = 0.05;

const CUBE_MESH_PATH_INDEX = 1;
const MONKEY_MESH_PATH_INDEX = 0; // Monkey
const MESH_PATHS = {
    Monkey: "../../meshes/monkey.obj",
    Cube: "../../meshes/cube.obj",
    Cone: "../../meshes/cone.obj",
    Sphere: "../../meshes/sphere.obj",
    "Ico Sphere": "../../meshes/ico-sphere.obj",
    Torus: "../../meshes/torus.obj",
};

const DEFAULT_SELECTED_SCENE_OBJ_COLOR = "green";

// #endregion

// #region Add/Remove SceneObjects Functions

function getUniqueName(baseName) {
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const existingNames = new Set();

    // Collect all existing names
    for (let i = 0; i < sceneObjsSelectElement.options.length; i++) {
        existingNames.add(sceneObjsSelectElement.options[i].text);
    }

    // If the base name is unique, use it as-is
    if (!existingNames.has(baseName)) {
        return baseName;
    }

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
        spawnPos = new Vector3(0, 0, CREATE_MIN_Z);
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
        spawnRot = new Vector3(0, DEFAULT_CREATE_Y_ROT, DEFAULT_CREATE_Z_ROT);
    }

    const sceneObject = new SceneObject(mesh, new Transform(spawnPos, spawnRot, Vector3.one()), new Material(SCENE_OBJ_DEFAULT_EDGE_COLOR));
    const id = engine.scene.addSceneObject(sceneObject);

    // The select element that's used to display the list of current scene objects
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    sceneObjsSelectElement.appendChild(new Option(displayName, id));

    // Select the newly created scene object
    sceneObjsSelectElement.selectedIndex = sceneObjsSelectElement.options.length - 1;

    updateClearButtonState(engine);
    updateRemoveButtonState();
    updateSceneObjectSelectionColors(engine);
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
        if (selectedIndex >= sceneObjsSelectElement.options.length) {
            sceneObjsSelectElement.selectedIndex = sceneObjsSelectElement.options.length - 1;
        } else {
            sceneObjsSelectElement.selectedIndex = selectedIndex;
        }
    }

    updateClearButtonState(engine);
    updateRemoveButtonState();
    updateSceneObjectSelectionColors(engine);
    updateSelectedObjectControls(engine);
}

function clearSceneObjects(engine) {
    const sceneObjects = engine.scene.sceneObjects;
    for (const sceneObject of sceneObjects) {
        engine.scene.removeSceneObject(sceneObject);
    }

    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    sceneObjsSelectElement.innerHTML = '';

    currentlySelectedSceneObjectId = null;
    updateClearButtonState(engine);
    updateRemoveButtonState();
    updateSelectedObjectControls(engine);
}

// #endregion

// #region Option Checkbox Input

/**
 * Creates a checkbox option input from the template and adds it to a parent element.
 * @param {string} title - The label text to display next to the checkbox
 * @param {HTMLElement} parentElement - The element to append the checkbox to
 * @param {function} onChange - Callback function that receives the checkbox checked state (boolean)
 * @param {boolean} initialChecked - Initial checked state (default: false)
 * @param {null} uniqueId - Optional unique ID for the checkbox (auto-generated if not provided)
 * @returns {HTMLInputElement} The created checkbox input element
 */
function addOptionCheckbox(title, parentElement, onChange, initialChecked = false, uniqueId = null) {
    const template = document.getElementById(OPTION_INPUT_CHECKBOX_TEMPLATE_ID);
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
    if (typeof onChange === "function") {
        checkbox.addEventListener("change", (event) => {
            onChange(event.target.checked);
        });
    }

    // Append to parent
    parentElement.appendChild(clone);

    // Call the onChange callback with initial-value after setup is complete
    if (typeof onChange === "function") {
        onChange(initialChecked);
    }

    return checkbox;
}

/**
 * Creates a slider option input from the template and adds it to a parent element.
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
function addOptionSlider(title, parentElement, onChange, min = 0, max = 100, step = 1, initialValue = null, uniqueId = null) {
    const template = document.getElementById(OPTION_INPUT_SLIDER_TEMPLATE_ID);
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
    if (typeof onChange === "function") {
        onChange(startValue);
    }

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
function addOptionColor(title, parentElement, onChange, initialColor = "#000000", uniqueId = null) {
    const template = document.getElementById(OPTION_INPUT_COLOR_TEMPLATE_ID);
    const clone = template.content.cloneNode(true);

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
    parentElement.appendChild(clone);

    // Call the onChange callback with initial value after setup is complete
    if (typeof onChange === "function") {
        onChange(initialColor);
    }

    return colorInput;
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
function addOptionGradient(title, parentElement, onChange, initialStartColor = "#000000", initialEndColor = "#ffffff", uniqueId = null) {
    const template = document.getElementById(OPTION_INPUT_GRADIENT_TEMPLATE_ID);
    const clone = template.content.cloneNode(true);

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
    parentElement.appendChild(clone);

    // Call the onChange callback with initial values after setup is complete
    if (typeof onChange === "function") {
        onChange({
            startColor: initialStartColor,
            endColor: initialEndColor
        });
    }

    return {startInput, endInput};
}

/**
 * Creates a color OR gradient picker input with a toggle checkbox.
 * When the checkbox is unchecked (default), displays a single color picker.
 * When checked, displays gradient start/end color pickers.
 * @param {string} title - The label text to display for the picker
 * @param {HTMLElement} parentElement - The element to append the picker to
 * @param {function} onChange - Callback function that receives an object: {isGradient: boolean, color?: string,
 *     startColor?: string, endColor?: string}
 * @param {boolean} initialIsGradient - Whether gradient mode is initially enabled (default: false)
 * @param {string} initialColor - Initial single color value in hex format (default: "#ffffff")
 * @param {string} initialStartColor - Initial gradient start color in hex format (default: "#000000")
 * @param {string} initialEndColor - Initial gradient end color in hex format (default: "#ffffff")
 * @param {null} uniqueId - Optional unique ID prefix for the inputs (auto-generated if not provided)
 * @returns {Object} Object containing {checkbox, singleColorInput, startColorInput, endColorInput,
 *     singleColorContainer, gradientColorsContainer}
 */
function addOptionColorOrGradient(
    title,
    parentElement,
    onChange,
    initialIsGradient = false,
    initialColor = "#ffffff",
    initialStartColor = "#000000",
    initialEndColor = "#ffffff",
    uniqueId = null
) {
    const template = document.getElementById(OPTION_INPUT_COLOR_OR_GRADIENT_TEMPLATE_ID);
    const clone = template.content.cloneNode(true);

    const label = clone.querySelector('.color-or-gradient-label');
    const checkbox = clone.querySelector('.gradient-toggle-checkbox');
    const singleColorContainer = clone.querySelector('.single-color-container');
    const singleColorInput = clone.querySelector('.single-color-input');
    const gradientColorsContainer = clone.querySelector('.gradient-colors-container');
    const startColorInput = clone.querySelector('.gradient-start-color-input');
    const endColorInput = clone.querySelector('.gradient-end-color-input');

    // Set the label text
    label.textContent = title;

    // Set unique IDs (generate from title if not provided)
    const idPrefix = uniqueId || `${makeDomSafeKey(title)}-color-or-gradient`;
    checkbox.id = `${idPrefix}-checkbox`;
    singleColorInput.id = `${idPrefix}-single`;
    startColorInput.id = `${idPrefix}-start`;
    endColorInput.id = `${idPrefix}-end`;

    // Set initial colors
    singleColorInput.value = initialColor;
    startColorInput.value = initialStartColor;
    endColorInput.value = initialEndColor;

    // Set initial checkbox state and visibility
    checkbox.checked = initialIsGradient;
    if (initialIsGradient) {
        singleColorContainer.style.display = 'none';
        gradientColorsContainer.style.display = 'flex';
    } else {
        singleColorContainer.style.display = 'flex';
        gradientColorsContainer.style.display = 'none';
    }

    // Helper to emit the current state
    const emitChange = () => {
        if (typeof onChange === "function") {
            if (checkbox.checked) {
                onChange({
                    isGradient: true,
                    startColor: startColorInput.value,
                    endColor: endColorInput.value
                });
            } else {
                onChange({
                    isGradient: false,
                    color: singleColorInput.value
                });
            }
        }
    };

    // Handle checkbox toggle
    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            singleColorContainer.style.display = 'none';
            gradientColorsContainer.style.display = 'flex';
        } else {
            singleColorContainer.style.display = 'flex';
            gradientColorsContainer.style.display = 'none';
        }
        emitChange();
    });

    // Handle color input changes
    singleColorInput.addEventListener("input", emitChange);
    startColorInput.addEventListener("input", emitChange);
    endColorInput.addEventListener("input", emitChange);

    // Append to parent
    parentElement.appendChild(clone);

    // Call the onChange callback with initial values after setup is complete
    emitChange();

    return {
        checkbox,
        singleColorInput,
        startColorInput,
        endColorInput,
        singleColorContainer,
        gradientColorsContainer
    };
}

// #endregion

// #region SceneObject Selection

function updateSelectedObjectControls(engine) {
    // Remove existing controls if they exist
    const existingPanel = document.getElementById(SELECTED_OBJ_TRANSFORM_PANEL_ID);
    if (existingPanel) {
        existingPanel.remove();
    }

    // Get the selected scene object
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const selectedIndex = sceneObjsSelectElement.selectedIndex;

    // If nothing is selected or no objects exist, return
    if (selectedIndex === -1 || sceneObjsSelectElement.options.length === 0) {
        return;
    }

    // Get the selected scene object by ID
    const selectedId = parseInt(sceneObjsSelectElement.value, 10);
    const sceneObject = engine.scene.getSceneObjectById(selectedId);

    if (!sceneObject) {
        return;
    }

    // Get the display name from the select option
    const displayName = sceneObjsSelectElement.options[selectedIndex].text;

    // Add transform controls for the selected object
    // Insert after the camera controls (index 1)
    addTransformInput(
        displayName,
        sceneObject.transform,
        true,  // isPos
        true,  // isRot
        true,  // isScale
        1,     // childIndex - insert after camera
        SELECTED_OBJ_TRANSFORM_PANEL_ID  // panelId
    );
}

function updateSceneObjectSelectionColors(engine) {
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const selectedIndex = sceneObjsSelectElement.selectedIndex;

    // Unselect the previous object
    if (currentlySelectedSceneObjectId !== null) {
        const previousSceneObject = engine.scene.getSceneObjectById(currentlySelectedSceneObjectId);
        if (previousSceneObject) {
            previousSceneObject.material.resetEdgeColor();
        }
    }

    // Select the new object
    if (selectedIndex !== -1 && sceneObjsSelectElement.options.length > 0) {
        const selectedId = parseInt(sceneObjsSelectElement.value, 10);
        const sceneObject = engine.scene.getSceneObjectById(selectedId);
        if (sceneObject) {
            sceneObject.material.edgeColor = selectedSceneObjectColor;
            currentlySelectedSceneObjectId = selectedId;
        }
    } else {
        currentlySelectedSceneObjectId = null;
    }
}

function updateClearButtonState(engine) {
    const clearButton = document.getElementById(CLEAR_SCENE_OBJS_BTN_ID);
    const hasSceneObjects = engine.scene.sceneObjects.length > 0;
    clearButton.disabled = !hasSceneObjects;
}

function updateRemoveButtonState() {
    const removeButton = document.getElementById(REMOVE_SCENE_OBJ_BTN_ID);
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const hasSelection = sceneObjsSelectElement.selectedIndex !== -1;
    const hasSceneObjects = sceneObjsSelectElement.options.length > 0;
    removeButton.disabled = !hasSelection || !hasSceneObjects;
}

// #endregion

// #region Transform Input

function addTransformInput(
    transformName,
    transform,
    isPos = true,
    isRot = true,
    isScale = true,
    childIndex = null,
    panelId = null
) {
    // The template contains a single div element with a header element child
    const template = document.getElementById(TRANSFORM_INPUTS_TEMPLATE_ID);
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

// #endregion

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

function initListeners(engine) {
    document.getElementById(CREATE_SCENE_OBJ_BTN_ID).addEventListener("click", () => createSceneObject(engine));
    document.getElementById(REMOVE_SCENE_OBJ_BTN_ID).addEventListener("click", () => removeSceneObject(engine));
    document.getElementById(CLEAR_SCENE_OBJS_BTN_ID).addEventListener("click", () => clearSceneObjects(engine));
    document.getElementById(SCENE_OBJS_SELECT_ID).addEventListener("change", () => {
        updateRemoveButtonState();
        updateSelectedObjectControls(engine);
        updateSceneObjectSelectionColors(engine);
    });
    window.addEventListener("resize", () => updateToBrowserSize(engine));
}

function addOptionsToMeshSelect() {
    const meshSelectElement = document.getElementById(CREATE_SCENE_OBJ_MESH_SELECT_ID);
    for (const [key, value] of Object.entries(MESH_PATHS)) {
        meshSelectElement.appendChild(new Option(key, value));
    }
    // Set the default selected mesh to a cube because it has the least vertices
    // This is in-case the user spams the create button as soon as the page loads
    meshSelectElement.selectedIndex = CUBE_MESH_PATH_INDEX;
}

async function init() {
    addOptionsToMeshSelect();

    const engine = new Engine(document.getElementById("canvas"));

    //engine.renderer.setBackgroundColor(BODY_BACKGROUND_COLOR);
    updateToBrowserSize(engine);

    initListeners(engine);
    updateClearButtonState(engine);
    updateRemoveButtonState();


    engine.isFrameRateCounter = true;

    // Add camera transform controls at the top of the inspector panel
    addTransformInput(
        "Camera",
        engine.camera.transform,
        true, // isPos
        true, // isRot
        false, // isScale - disable scale for camera
        0 // childIndex - insert at the top
    );

    // Add rendering options checkboxes
    const renderingOptionsPanel = document.getElementById("rendering-options-panel");

    addOptionCheckbox(
        "Depth Sorting",
        renderingOptionsPanel,
        (checked) => {
            engine.isDepthSorting = checked;
        },
        true // initially checked
    );

    addOptionCheckbox(
        "Back Face Culling",
        renderingOptionsPanel,
        (checked) => {
            engine.camera.isBackFaceCulling = checked;
        },
        true // initially checked
    );

    addOptionSlider(
        "Field of View",
        renderingOptionsPanel,
        (value) => {
            engine.camera.setFov(value);
        },
        MIN_FOV,
        MAX_FOV,
        FOV_STEP,
        DEFAULT_FOV
    );

    addOptionSlider(
        "Resolution Scale",
        renderingOptionsPanel,
        (value) => {
            resolutionScale = value;
            updateToBrowserSize(engine);
        },
        MIN_RESOLUTION_SCALE,
        MAX_RESOLUTION_SCALE,
        RESOLUTION_SCALE_STEP,
        DEFAULT_RESOLUTION_SCALE
    );

    addOptionColor(
        "Selected Object Color",
        renderingOptionsPanel,
        (color) => {
            selectedSceneObjectColor = color;
            // Update the selected object immediately if there is one
            if (currentlySelectedSceneObjectId !== null) {
                const selectedObject = engine.scene.getSceneObjectById(currentlySelectedSceneObjectId);
                if (selectedObject) {
                    selectedObject.material.edgeColor = color;
                }
            }
        },
        selectedSceneObjectColor
    );

    // Create a scene object in the center of the screen
    await createSceneObject(engine, null, null, MONKEY_MESH_PATH_INDEX);

    // Note: createSceneObject already selects the object and updates UI
    // The following lines are technically redundant but kept for clarity
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    sceneObjsSelectElement.selectedIndex = 0;
    updateRemoveButtonState();
    updateSceneObjectSelectionColors(engine);
    updateSelectedObjectControls(engine);

    engine.start();
}

import {Engine, Material, SceneObject, Transform, Vector2, Vector3, WavefrontMeshConverter} from 'canvas-js-3d';

let isMobile = false;
let resolutionScale = DEFAULT_RESOLUTION_SCALE;
let selectedSceneObjectColor = DEFAULT_SELECTED_SCENE_OBJ_COLOR;
const meshCache = new Map();
let currentlySelectedSceneObjectId = null;

init();
