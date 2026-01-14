import { Engine, Mesh, SceneObject, Transform, Vector3, Vector2, WavefrontMeshConverter } from '../src/index.js';

// ============================================================================
// Canvas & Engine Setup
// ============================================================================

const canvas = document.getElementById('canvas');
const engine = new Engine(canvas, 'cyan', 'black');

// ============================================================================
// Mesh Loading
// ============================================================================

const meshPaths = {
    cube: '../meshes/cube.obj',
    cone: '../meshes/cone.obj',
    sphere: '../meshes/sphere.obj',
    'ico-sphere': '../meshes/ico-sphere.obj',
    torus: '../meshes/torus.obj',
    monkey: '../meshes/monkey.obj',
};

const meshCache = new Map();

async function loadMesh(name) {
    if (meshCache.has(name)) {
        return meshCache.get(name);
    }
    const mesh = await WavefrontMeshConverter.fromUrl(meshPaths[name]);
    meshCache.set(name, mesh);
    return mesh;
}

// ============================================================================
// Scene Object
// ============================================================================

let sceneObject = null;

async function setMesh(name) {
    const mesh = await loadMesh(name);
    const transform = sceneObject
        ? sceneObject.transform
        : new Transform(new Vector3(0, 0, 5), Vector3.zero(), Vector3.one());

    if (sceneObject) {
        engine.scene.removeSceneObject(sceneObject);
    }

    sceneObject = new SceneObject(mesh, transform);
    engine.scene.addSceneObject(sceneObject);
}

// ============================================================================
// UI Controls
// ============================================================================

const controls = {
    posX: document.getElementById('posX'),
    posY: document.getElementById('posY'),
    posZ: document.getElementById('posZ'),
    rotX: document.getElementById('rotX'),
    rotY: document.getElementById('rotY'),
    rotZ: document.getElementById('rotZ'),
    scaleX: document.getElementById('scaleX'),
    scaleY: document.getElementById('scaleY'),
    scaleZ: document.getElementById('scaleZ'),
    autoRotate: document.getElementById('autoRotate'),
    fov: document.getElementById('fov'),
    camPosX: document.getElementById('camPosX'),
    camPosY: document.getElementById('camPosY'),
    camPosZ: document.getElementById('camPosZ'),
    camRotX: document.getElementById('camRotX'),
    camRotY: document.getElementById('camRotY'),
    camRotZ: document.getElementById('camRotZ'),
    meshSelect: document.getElementById('meshSelect'),
    backFaceCulling: document.getElementById('backFaceCulling'),
    depthSorting: document.getElementById('depthSorting'),
    resolution: document.getElementById('resolution'),
};

const values = {
    posX: document.getElementById('posXVal'),
    posY: document.getElementById('posYVal'),
    posZ: document.getElementById('posZVal'),
    rotX: document.getElementById('rotXVal'),
    rotY: document.getElementById('rotYVal'),
    rotZ: document.getElementById('rotZVal'),
    scaleX: document.getElementById('scaleXVal'),
    scaleY: document.getElementById('scaleYVal'),
    scaleZ: document.getElementById('scaleZVal'),
    autoRotate: document.getElementById('autoRotateVal'),
    fov: document.getElementById('fovVal'),
    camPosX: document.getElementById('camPosXVal'),
    camPosY: document.getElementById('camPosYVal'),
    camPosZ: document.getElementById('camPosZVal'),
    camRotX: document.getElementById('camRotXVal'),
    camRotY: document.getElementById('camRotYVal'),
    camRotZ: document.getElementById('camRotZVal'),
};

function updateTransformFromControls() {
    if (!sceneObject) return;
    sceneObject.transform.setPosition(
        parseFloat(controls.posX.value),
        parseFloat(controls.posY.value),
        parseFloat(controls.posZ.value)
    );
    sceneObject.transform.setRotation(
        parseFloat(controls.rotX.value),
        parseFloat(controls.rotY.value),
        parseFloat(controls.rotZ.value)
    );
    sceneObject.transform.setScale(
        parseFloat(controls.scaleX.value),
        parseFloat(controls.scaleY.value),
        parseFloat(controls.scaleZ.value)
    );
}

function updateDisplayValues() {
    values.posX.textContent = parseFloat(controls.posX.value).toFixed(1);
    values.posY.textContent = parseFloat(controls.posY.value).toFixed(1);
    values.posZ.textContent = parseFloat(controls.posZ.value).toFixed(1);
    values.rotX.textContent = parseFloat(controls.rotX.value).toFixed(2);
    values.rotY.textContent = parseFloat(controls.rotY.value).toFixed(2);
    values.rotZ.textContent = parseFloat(controls.rotZ.value).toFixed(2);
    values.scaleX.textContent = parseFloat(controls.scaleX.value).toFixed(1);
    values.scaleY.textContent = parseFloat(controls.scaleY.value).toFixed(1);
    values.scaleZ.textContent = parseFloat(controls.scaleZ.value).toFixed(1);
    values.autoRotate.textContent = parseFloat(controls.autoRotate.value).toFixed(1);
    values.fov.textContent = controls.fov.value;
    values.camPosX.textContent = parseFloat(controls.camPosX.value).toFixed(1);
    values.camPosY.textContent = parseFloat(controls.camPosY.value).toFixed(1);
    values.camPosZ.textContent = parseFloat(controls.camPosZ.value).toFixed(1);
    values.camRotX.textContent = parseFloat(controls.camRotX.value).toFixed(2);
    values.camRotY.textContent = parseFloat(controls.camRotY.value).toFixed(2);
    values.camRotZ.textContent = parseFloat(controls.camRotZ.value).toFixed(2);
}

function updateCameraFromControls() {
    engine.camera.transform.setPosition(
        parseFloat(controls.camPosX.value),
        parseFloat(controls.camPosY.value),
        parseFloat(controls.camPosZ.value)
    );
    engine.camera.transform.setRotation(
        parseFloat(controls.camRotX.value),
        parseFloat(controls.camRotY.value),
        parseFloat(controls.camRotZ.value)
    );
}

// Bind all range inputs
for (const key of Object.keys(controls)) {
    if (controls[key].tagName === 'INPUT') {
        controls[key].addEventListener('input', () => {
            updateDisplayValues();
            updateTransformFromControls();
            updateCameraFromControls();
        });
    }
}

// FOV control
controls.fov.addEventListener('input', () => {
    engine.camera.setFov(parseFloat(controls.fov.value));
    values.fov.textContent = controls.fov.value;
});

// Back-face culling toggle
controls.backFaceCulling.addEventListener('change', () => {
    engine.camera.toggleBackFaceCulling(controls.backFaceCulling.checked);
});

// Depth sorting toggle
controls.depthSorting.addEventListener('change', () => {
    engine.toggleDepthSorting(controls.depthSorting.checked);
});

// Reset camera button
document.getElementById('resetCamera').addEventListener('click', () => {
    controls.fov.value = 60;
    controls.camPosX.value = 0;
    controls.camPosY.value = 0;
    controls.camPosZ.value = 0;
    controls.camRotX.value = 0;
    controls.camRotY.value = 0;
    controls.camRotZ.value = 0;
    controls.backFaceCulling.checked = false;
    controls.depthSorting.checked = false;
    engine.camera.setFov(60);
    engine.camera.toggleBackFaceCulling(false);
    engine.toggleDepthSorting(false);
    updateDisplayValues();
    updateCameraFromControls();
});

// Mesh selector
controls.meshSelect.addEventListener('change', () => {
    setMesh(controls.meshSelect.value);
});

// Resolution
controls.resolution.addEventListener('change', () => {
    const [width, height] = controls.resolution.value.split('x').map(Number);
    engine.setScreenSize(new Vector2(width, height));
});

// Reset button
document.getElementById('resetTransform').addEventListener('click', () => {
    controls.posX.value = 0;
    controls.posY.value = 0;
    controls.posZ.value = 5;
    controls.rotX.value = 0;
    controls.rotY.value = 0;
    controls.rotZ.value = 0;
    controls.scaleX.value = 1;
    controls.scaleY.value = 1;
    controls.scaleZ.value = 1;
    controls.autoRotate.value = 0;
    controls.fov.value = 60;
    engine.camera.setFov(60);
    updateDisplayValues();
    updateTransformFromControls();
});

// ============================================================================
// Unit Tests
// ============================================================================

const testResults = document.getElementById('testResults');

function log(message, type = 'info') {
    const line = document.createElement('div');
    line.className = type;
    line.textContent = message;
    testResults.appendChild(line);
    testResults.scrollTop = testResults.scrollHeight;
}

function clearLog() {
    testResults.innerHTML = '';
}

function assert(condition, message) {
    if (condition) {
        log(`✓ ${message}`, 'pass');
        return true;
    } else {
        log(`✗ ${message}`, 'fail');
        return false;
    }
}

function approxEqual(a, b, epsilon = 0.0001) {
    return Math.abs(a - b) < epsilon;
}

// Vector3 Tests
function testVector3() {
    log('--- Vector3 Tests ---', 'info');
    let passed = 0, total = 0;

    // Constructor
    total++;
    const v = new Vector3(1, 2, 3);
    if (assert(v.x === 1 && v.y === 2 && v.z === 3, 'Constructor sets x, y, z')) passed++;

    // Static methods
    total++;
    if (assert(Vector3.zero().x === 0 && Vector3.zero().y === 0 && Vector3.zero().z === 0, 'Vector3.zero() is (0,0,0)')) passed++;

    total++;
    if (assert(Vector3.one().x === 1 && Vector3.one().y === 1 && Vector3.one().z === 1, 'Vector3.one() is (1,1,1)')) passed++;

    // getTranslated
    total++;
    const translated = v.getTranslated(new Vector3(1, 1, 1));
    if (assert(translated.x === 2 && translated.y === 3 && translated.z === 4, 'getTranslated adds vectors')) passed++;

    total++;
    if (assert(v.x === 1 && v.y === 2 && v.z === 3, 'getTranslated is immutable')) passed++;

    // getScaled (scalar)
    total++;
    const scaled = v.getScaled(2);
    if (assert(scaled.x === 2 && scaled.y === 4 && scaled.z === 6, 'getScaled multiplies by scalar')) passed++;

    // getScaledByVector
    total++;
    const scaledByVec = v.getScaledByVector(new Vector3(2, 3, 4));
    if (assert(scaledByVec.x === 2 && scaledByVec.y === 6 && scaledByVec.z === 12, 'getScaledByVector component-wise scale')) passed++;

    // getRotatedY (90 degrees)
    total++;
    const rotY = new Vector3(1, 0, 0).getRotatedY(Math.PI / 2);
    if (assert(approxEqual(rotY.x, 0) && approxEqual(rotY.z, 1), 'getRotatedY rotates around Y axis')) passed++;

    // getRotatedX (90 degrees)
    total++;
    const rotX = new Vector3(0, 1, 0).getRotatedX(Math.PI / 2);
    if (assert(approxEqual(rotX.y, 0) && approxEqual(rotX.z, 1), 'getRotatedX rotates around X axis')) passed++;

    // getRotatedZ (90 degrees)
    total++;
    const rotZ = new Vector3(1, 0, 0).getRotatedZ(Math.PI / 2);
    if (assert(approxEqual(rotZ.x, 0) && approxEqual(rotZ.y, 1), 'getRotatedZ rotates around Z axis')) passed++;

    // getMagnitude
    total++;
    const mag = new Vector3(3, 4, 0).getMagnitude();
    if (assert(approxEqual(mag, 5), 'getMagnitude returns correct length')) passed++;

    // getNormalized
    total++;
    const norm = new Vector3(0, 4, 0).getNormalized();
    if (assert(approxEqual(norm.y, 1) && approxEqual(norm.getMagnitude(), 1), 'getNormalized returns unit vector')) passed++;

    // isZero
    total++;
    if (assert(Vector3.zero().isZero() && !v.isZero(), 'isZero correctly identifies zero vectors')) passed++;

    log(`Vector3: ${passed}/${total} passed`, passed === total ? 'pass' : 'fail');
    return { passed, total };
}

// Transform Tests
function testTransform() {
    log('--- Transform Tests ---', 'info');
    let passed = 0, total = 0;

    // Constructor
    total++;
    const t = new Transform(new Vector3(1, 2, 3), new Vector3(0.1, 0.2, 0.3), new Vector3(1, 1, 1));
    if (assert(t.position.x === 1 && t.rotation.y === 0.2 && t.scale.z === 1, 'Constructor sets all properties')) passed++;

    // translate
    total++;
    t.translate(new Vector3(1, 0, 0));
    if (assert(t.position.x === 2, 'translate moves position')) passed++;

    // rotateX
    total++;
    const t2 = new Transform(Vector3.zero(), Vector3.zero(), Vector3.one());
    t2.rotateX(0.5);
    if (assert(approxEqual(t2.rotation.x, 0.5), 'rotateX adds to rotation.x')) passed++;

    // rotateY
    total++;
    t2.rotateY(0.3);
    if (assert(approxEqual(t2.rotation.y, 0.3), 'rotateY adds to rotation.y')) passed++;

    // rotateZ
    total++;
    t2.rotateZ(0.1);
    if (assert(approxEqual(t2.rotation.z, 0.1), 'rotateZ adds to rotation.z')) passed++;

    // scaleBy (uniform)
    total++;
    const t3 = new Transform(Vector3.zero(), Vector3.zero(), Vector3.one());
    t3.scaleBy(2);
    if (assert(t3.scale.x === 2 && t3.scale.y === 2 && t3.scale.z === 2, 'scaleBy scales uniformly')) passed++;

    // scaleX
    total++;
    const t4 = new Transform(Vector3.zero(), Vector3.zero(), Vector3.one());
    t4.scaleX(3);
    if (assert(t4.scale.x === 3 && t4.scale.y === 1 && t4.scale.z === 1, 'scaleX only scales X')) passed++;

    // scaleY
    total++;
    t4.scaleY(2);
    if (assert(t4.scale.y === 2, 'scaleY only scales Y')) passed++;

    // scaleZ
    total++;
    t4.scaleZ(4);
    if (assert(t4.scale.z === 4, 'scaleZ only scales Z')) passed++;

    // Non-uniform scale in SceneObject
    total++;
    const mesh = new Mesh([new Vector3(1, 1, 1)], []);
    const obj = new SceneObject(mesh, new Transform(Vector3.zero(), Vector3.zero(), new Vector3(2, 3, 4)));
    const verts = obj.getSceneVertices();
    if (assert(verts[0].x === 2 && verts[0].y === 3 && verts[0].z === 4, 'SceneObject applies non-uniform scale')) passed++;

    log(`Transform: ${passed}/${total} passed`, passed === total ? 'pass' : 'fail');
    return { passed, total };
}

// Camera Tests
function testCamera() {
    log('--- Camera Tests ---', 'info');
    let passed = 0, total = 0;

    // Reset camera state before testing
    engine.camera.toggleBackFaceCulling(false);
    engine.camera.transform.setPosition(0, 0, 0);
    engine.camera.transform.setRotation(0, 0, 0);

    // isBackFaceCulling after reset
    total++;
    if (assert(engine.camera.isBackFaceCulling() === false, 'Back-face culling is off after reset')) passed++;

    // toggleBackFaceCulling with parameter (enable)
    total++;
    engine.camera.toggleBackFaceCulling(true);
    if (assert(engine.camera.isBackFaceCulling() === true, 'toggleBackFaceCulling(true) enables culling')) passed++;

    // toggleBackFaceCulling with parameter (disable)
    total++;
    engine.camera.toggleBackFaceCulling(false);
    if (assert(engine.camera.isBackFaceCulling() === false, 'toggleBackFaceCulling(false) disables culling')) passed++;

    // toggleBackFaceCulling without parameter (flip)
    total++;
    engine.camera.toggleBackFaceCulling();
    if (assert(engine.camera.isBackFaceCulling() === true, 'toggleBackFaceCulling() flips state to true')) passed++;

    total++;
    engine.camera.toggleBackFaceCulling();
    if (assert(engine.camera.isBackFaceCulling() === false, 'toggleBackFaceCulling() flips state to false')) passed++;

    // isBackFacing tests
    // In this engine (+Z forward), winding determines normal direction:
    // - Vertices (0,0,5), (1,0,5), (0,1,5) produce normal (0,0,1) pointing +Z (away from camera)
    // - Vertices (0,0,5), (0,1,5), (1,0,5) produce normal (0,0,-1) pointing -Z (toward camera)

    total++;
    const backFace = [
        new Vector3(0, 0, 5),   // v0
        new Vector3(1, 0, 5),   // v1
        new Vector3(0, 1, 5),   // v2
    ];
    // Normal points +Z (away from camera) = back-facing
    if (assert(engine.camera.isBackFacing(backFace) === true, 'Face with normal pointing away from camera is back-facing')) passed++;

    total++;
    const frontFace = [
        new Vector3(0, 0, 5),   // v0
        new Vector3(0, 1, 5),   // v1 (swapped)
        new Vector3(1, 0, 5),   // v2 (swapped)
    ];
    // Normal points -Z (toward camera) = front-facing
    if (assert(engine.camera.isBackFacing(frontFace) === false, 'Face with normal pointing toward camera is front-facing')) passed++;

    log(`Camera: ${passed}/${total} passed`, passed === total ? 'pass' : 'fail');
    return { passed, total };
}

// Run all tests
function runAllTests() {
    clearLog();
    log('Running all tests...', 'info');
    log('', 'info');

    const v3 = testVector3();
    log('', 'info');
    const tr = testTransform();
    log('', 'info');
    const cam = testCamera();

    log('', 'info');
    const totalPassed = v3.passed + tr.passed + cam.passed;
    const totalTests = v3.total + tr.total + cam.total;
    log(`=== Total: ${totalPassed}/${totalTests} passed ===`, totalPassed === totalTests ? 'pass' : 'fail');
}

// Button bindings
document.getElementById('runTests').addEventListener('click', runAllTests);
document.getElementById('testVector3').addEventListener('click', () => {
    clearLog();
    testVector3();
});
document.getElementById('testTransform').addEventListener('click', () => {
    clearLog();
    testTransform();
});
document.getElementById('testCamera').addEventListener('click', () => {
    clearLog();
    testCamera();
});

// ============================================================================
// Render Loop
// ============================================================================

updateDisplayValues();

// FPS counter
const fpsCounter = document.getElementById('fpsCounter');
let frameCount = 0;
let fpsTime = 0;

engine.onUpdate = (dt) => {
    // Update FPS counter
    frameCount++;
    fpsTime += dt;
    if (fpsTime >= 1.0) {
        fpsCounter.textContent = frameCount;
        frameCount = 0;
        fpsTime = 0;
    }

    if (!sceneObject) return;
    
    // Auto-rotation
    const speed = parseFloat(controls.autoRotate.value);
    if (speed > 0) {
        sceneObject.transform.rotateY(speed * dt);
        controls.rotY.value = sceneObject.transform.rotation.y % (Math.PI * 2);
        values.rotY.textContent = parseFloat(controls.rotY.value).toFixed(2);
    }
};

// ============================================================================
// Initialize
// ============================================================================

setMesh('cube').then(() => engine.start());
