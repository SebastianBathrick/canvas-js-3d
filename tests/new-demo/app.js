// #region Constants

const INSPECTOR_PANEL_ID = "inspector-panel";
const VIEWPORT_PANEL_ID = "viewport-panel";

const MOBILE_WIDTH_THRESHOLD = 768;
const INSPECTOR_PANEL_DESKTOP_WIDTH_PX = 275;

const POS_INC = 0.5;
const ROT_INC = .01;
const SCALE_INC = 0.1;
const VECTOR_INPUT_TEMPLATE_ID = "vector-input-template";
const POS_PREFIX = "pos";
const ROT_PREFIX = "rot";
const SCALE_PREFIX = "scale";
const POS_LABEL = "Position";
const ROT_LABEL = "Rotation";
const SCALE_LABEL = "Scale";

const CREATE_MAX_X = 5;
const CREATE_MAX_Y = 5;
const CREATE_MIN_Z = 7;
const CREATE_MAX_Z = 20;

const TRANSFORM_INPUTS_TEMPLATE_ID = "transform-input-template";

// ID for the selected object's transform controls
const SELECTED_OBJ_TRANSFORM_PANEL_ID = "selected-obj-transform-panel";

// The select element where the user picks from a limited list of predefined meshes
const CREATE_SCENE_OBJ_MESH_SELECT_ID = "create-scene-obj-mesh-select";

// The select element that's used to display the list of current scene objects
const SCENE_OBJS_SELECT_ID = "scene-objs-select";
const CREATE_SCENE_OBJ_BTN_ID = "create-scene-obj-btn";
const REMOVE_SCENE_OBJ_BTN_ID = "remove-scene-obj-btn";
const CLEAR_SCENE_OBJS_BTN_ID = "clear-scene-objs-btn";
const MESH_PATHS = {
    Monkey: "../../meshes/monkey.obj",
    Cube: "../../meshes/cube.obj",
    Cone: "../../meshes/cone.obj",
    Sphere: "../../meshes/sphere.obj",
    "Ico Sphere": "../../meshes/ico-sphere.obj",
    Torus: "../../meshes/torus.obj",
};

const DEFAULT_MESH_PATH_INDEX = 0;

// #endregion

// #region Add/Remove SceneObjects Functions

const meshCache = new Map();

function updateClearButtonState(engine) {
    const clearButton = document.getElementById(CLEAR_SCENE_OBJS_BTN_ID);
    const hasSceneObjects = engine.scene.getSceneObjects().length > 0;
    clearButton.disabled = !hasSceneObjects;
}

function updateRemoveButtonState() {
    const removeButton = document.getElementById(REMOVE_SCENE_OBJ_BTN_ID);
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    const hasSelection = sceneObjsSelectElement.selectedIndex !== -1;
    const hasSceneObjects = sceneObjsSelectElement.options.length > 0;
    removeButton.disabled = !hasSelection || !hasSceneObjects;
}

async function createSceneObject(engine) {
    // The select element where the user picks from a limited list of predefined meshes
    const meshSelectElement = document.getElementById(CREATE_SCENE_OBJ_MESH_SELECT_ID);

    const objFileUrl = meshSelectElement.value;
    const displayName = meshSelectElement.options[meshSelectElement.selectedIndex].text;

    let mesh;
    if (meshCache.has(objFileUrl)) {
        mesh = meshCache.get(objFileUrl);
    } else {
        mesh = await WavefrontMeshConverter.fromUrl(objFileUrl);
        meshCache.set(objFileUrl, mesh);
    }

    let spawnPos = null;
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    

    if (engine.scene.getSceneObjects().length > 0) 
        spawnPos = new Vector3(
            randomInt(-CREATE_MAX_X, CREATE_MAX_X),
            randomInt(-CREATE_MAX_Y, CREATE_MAX_Y),
            randomInt(CREATE_MIN_Z, CREATE_MAX_Z)
        );    
    else
        spawnPos = new Vector3(0, 0, CREATE_MIN_Z);
    
    const sceneObject = new SceneObject(mesh, new Transform(spawnPos, Vector3.zero(), Vector3.one()));
    const id = engine.scene.addSceneObject(sceneObject);

    // The select element that's used to display the list of current scene objects
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    sceneObjsSelectElement.appendChild(new Option(displayName, id));

    updateClearButtonState(engine);
    updateRemoveButtonState();
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

    updateClearButtonState(engine);
    updateRemoveButtonState();
    updateSelectedObjectControls(engine);
}

function clearSceneObjects(engine) {
    const sceneObjects = engine.scene.getSceneObjects();
    for (const sceneObject of sceneObjects) {
        engine.scene.removeSceneObject(sceneObject);
    }

    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    sceneObjsSelectElement.innerHTML = '';

    updateClearButtonState(engine);
    updateRemoveButtonState();
    updateSelectedObjectControls(engine);
}

// #endregion

// #region Selected Object Transform Controls

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
          transform.position.x = pos.x;
          transform.position.y = pos.y;
          transform.position.z = pos.z;
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
          transform.rotation.x = rot.x;
          transform.rotation.y = rot.y;
          transform.rotation.z = rot.z;
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
          transform.scale.x = scale.x;
          transform.scale.y = scale.y;
          transform.scale.z = scale.z;
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
    const bodyWidth = document.body.clientWidth;

    isMobile = bodyWidth <= MOBILE_WIDTH_THRESHOLD;
    const inspector = document.getElementById(INSPECTOR_PANEL_ID);
    const viewport = document.getElementById(VIEWPORT_PANEL_ID);

    if (!isMobile)
    {
        // Inspector is a slim column to the left of the window from top to bottom (100% height)
        inspector.style.width = INSPECTOR_PANEL_DESKTOP_WIDTH_PX + "px";
        const viewportHeight = viewport.clientHeight;

        // It won't be exact but the background color will cover the difference ()
        engine.setScreenSize(new Vector2(bodyWidth - INSPECTOR_PANEL_DESKTOP_WIDTH_PX, viewportHeight));
    }


}


function initListeners(engine) {
    document.getElementById(CREATE_SCENE_OBJ_BTN_ID).addEventListener("click", () => createSceneObject(engine));
    document.getElementById(REMOVE_SCENE_OBJ_BTN_ID).addEventListener("click", () => removeSceneObject(engine));
    document.getElementById(CLEAR_SCENE_OBJS_BTN_ID).addEventListener("click", () => clearSceneObjects(engine));
    document.getElementById(SCENE_OBJS_SELECT_ID).addEventListener("change", () => {
        updateRemoveButtonState();
        updateSelectedObjectControls(engine);
    });
    window.addEventListener("resize", () => updateToBrowserSize(engine));
}

import { Engine, SceneObject, Transform, Vector3, WavefrontMeshConverter, Vector2 } from 'canvas-js-3d';

function addOptionsToMeshSelect() {
    const meshSelectElement = document.getElementById(CREATE_SCENE_OBJ_MESH_SELECT_ID);
    for (const [key, value] of Object.entries(MESH_PATHS)) {
        meshSelectElement.appendChild(new Option(key, value));
    }
    meshSelectElement.selectedIndex = DEFAULT_MESH_PATH_INDEX;
}

function moveCamera(engine, pos) {
    const transform = engine.camera.transform;
    const diff = transform.position.getDifference(pos);
    transform.move(diff);
}

async function init() {
    addOptionsToMeshSelect();

    const engine = new Engine(document.getElementById("canvas"), "cyan", "black");
    //engine.renderer.setBackgroundColor(BODY_BACKGROUND_COLOR);
    updateToBrowserSize(engine);

    initListeners(engine);
    updateClearButtonState(engine);
    updateRemoveButtonState();

    // Add camera transform controls at the top of the inspector panel
    addTransformInput(
        "Camera",
        engine.camera.transform,
        true, // isPos
        true, // isRot
        false, // isScale - disable scale for camera
        0 // childIndex - insert at the top
    );

    // Create a scene object in the center of the screen
    await createSceneObject(engine);

    // Select the scene object
    const sceneObjsSelectElement = document.getElementById(SCENE_OBJS_SELECT_ID);
    sceneObjsSelectElement.selectedIndex = 0;
    updateRemoveButtonState();
    updateSelectedObjectControls(engine);

    engine.renderer.setBgColor
    engine.start();
}

let isMobile = false;

init();
