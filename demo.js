import { Vector3, Transform, SceneObject, Engine, WavefrontMeshConverter } from './src/index.js';

const canvas = document.getElementById('canvas');

// Size canvas to fit available space
function calculateCanvasSize() {
    const isMobile = window.innerWidth <= 768;
    const padding = 20;
    
    if (isMobile) {
        // Mobile: canvas takes full width, partial height
        const availableWidth = window.innerWidth - padding;
        const availableHeight = window.innerHeight * 0.5 - padding;
        return Math.min(availableWidth, availableHeight, 500);
    } else {
        // Desktop: account for controls panel
        const controlsWidth = 280;
        const availableWidth = window.innerWidth - controlsWidth - padding * 2;
        const availableHeight = window.innerHeight - padding * 2;
        return Math.min(availableWidth, availableHeight, 900);
    }
}

const canvasSize = calculateCanvasSize();
canvas.width = canvasSize;
canvas.height = canvasSize;

const engine = new Engine(canvas, 'green', 'black');

// Track spawned models and their meshes
const models = [];
const meshCache = new Map();
const MAX_MODELS = 9;

// Spawn positions for models (offset from base position)
const spawnOffsets = [
    new Vector3(0, 0, 0),
    new Vector3(3, 0, 0),
    new Vector3(-3, 0, 0),
    new Vector3(0, 3, 0),
    new Vector3(0, -3, 0),
    new Vector3(3, 3, 0),
    new Vector3(-3, 3, 0),
    new Vector3(3, -3, 0),
    new Vector3(-3, -3, 0),
    new Vector3(0, 0, 3),
];

// Control values
let rotationSpeed = 0.5;
let scale = 1.0;
let positionOffset = new Vector3(0, 0, 5);

// UI Elements
const modelSelect = document.getElementById('modelSelect');
const addModelBtn = document.getElementById('addModelBtn');
const modelCountSpan = document.getElementById('modelCount');
const rotationSpeedSlider = document.getElementById('rotationSpeed');
const rotationSpeedValue = document.getElementById('rotationSpeedValue');
const scaleSlider = document.getElementById('scale');
const scaleValue = document.getElementById('scaleValue');
const posXSlider = document.getElementById('posX');
const posXValue = document.getElementById('posXValue');
const posYSlider = document.getElementById('posY');
const posYValue = document.getElementById('posYValue');
const posZSlider = document.getElementById('posZ');
const posZValue = document.getElementById('posZValue');
const clearSceneBtn = document.getElementById('clearSceneBtn');
const fpsCounter = document.getElementById('fpsCounter');
const meshStats = document.getElementById('meshStats');

// Load mesh with caching
async function loadMesh(url) {
    if (meshCache.has(url))
        return meshCache.get(url);

    const mesh = await WavefrontMeshConverter.fromUrl(url);
    meshCache.set(url, mesh);
    return mesh;
}

// Add a new model to the scene
async function addModel() {
    if (models.length >= MAX_MODELS)
        return;

    const url = modelSelect.value;
    const mesh = await loadMesh(url);

    const spawnOffset = spawnOffsets[models.length];
    const position = positionOffset.getTranslated(spawnOffset);

    const sceneObject = new SceneObject(
        mesh,
        new Transform(position, Vector3.zero, scale)
    );

    engine.addSceneObject(sceneObject);
    models.push(sceneObject);

    updateModelCount();
}

// Clear all models from the scene
function clearScene() {
    for (const model of models)
        engine.removeSceneObject(model);

    models.length = 0;
    updateModelCount();
}

// Update all model transforms based on current control values
function updateModelTransforms() {
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const spawnOffset = spawnOffsets[i];
        const position = positionOffset.getTranslated(spawnOffset);

        model.transform.position = position;
        model.transform.scale = scale;
    }
}

// Update model count display
function updateModelCount() {
    modelCountSpan.textContent = models.length;
    addModelBtn.disabled = models.length >= MAX_MODELS;
    updateMeshStats();
}

// Calculate and update mesh statistics
function updateMeshStats() {
    let totalVerts = 0;
    let totalFaces = 0;
    let totalEdges = 0;

    for (const model of models) {
        const mesh = model.mesh;
        totalVerts += mesh.vertices.length;
        totalFaces += mesh.faceIndices.length;

        // Count unique edges per mesh
        const edgeSet = new Set();
        for (const face of mesh.faceIndices) {
            for (let i = 0; i < face.length; i++) {
                const a = face[i];
                const b = face[(i + 1) % face.length];
                // Normalize edge as "min-max" to avoid counting both directions
                const edgeKey = a < b ? `${a}-${b}` : `${b}-${a}`;
                edgeSet.add(edgeKey);
            }
        }
        totalEdges += edgeSet.size;
    }

    meshStats.textContent = `Verts: ${totalVerts} | Edges: ${totalEdges} | Faces: ${totalFaces}`;
}

// Event listeners
addModelBtn.addEventListener('click', addModel);
clearSceneBtn.addEventListener('click', clearScene);

rotationSpeedSlider.addEventListener('input', () => {
    rotationSpeed = parseFloat(rotationSpeedSlider.value);
    rotationSpeedValue.textContent = rotationSpeed.toFixed(1);
});

scaleSlider.addEventListener('input', () => {
    scale = parseFloat(scaleSlider.value);
    scaleValue.textContent = scale.toFixed(1);
    updateModelTransforms();
});

posXSlider.addEventListener('input', () => {
    positionOffset = new Vector3(
        parseFloat(posXSlider.value),
        positionOffset.y,
        positionOffset.z
    );
    posXValue.textContent = positionOffset.x.toFixed(1);
    updateModelTransforms();
});

posYSlider.addEventListener('input', () => {
    positionOffset = new Vector3(
        positionOffset.x,
        parseFloat(posYSlider.value),
        positionOffset.z
    );
    posYValue.textContent = positionOffset.y.toFixed(1);
    updateModelTransforms();
});

posZSlider.addEventListener('input', () => {
    positionOffset = new Vector3(
        positionOffset.x,
        positionOffset.y,
        parseFloat(posZSlider.value)
    );
    posZValue.textContent = positionOffset.z.toFixed(1);
    updateModelTransforms();
});

// FPS calculation
let frameCount = 0;
let fpsTime = 0;

// Animation: rotate all models each frame
engine.onUpdate = (deltaTime) => {
    // Update FPS counter
    frameCount++;
    fpsTime += deltaTime;
    if (fpsTime >= 1.0) {
        fpsCounter.textContent = `${frameCount} FPS`;
        frameCount = 0;
        fpsTime = 0;
    }

    for (let i = 0; i < models.length; i++) {
        // Alternate rotation direction for each model
        const direction = i % 2 === 0 ? 1 : -1;
        const rotationDelta = direction * Math.PI * rotationSpeed * deltaTime;
        models[i].transform.rotation = models[i].transform.rotation.getTranslated(
            new Vector3(0, rotationDelta, 0)
        );
    }
};

// Load initial monkey and start engine
loadMesh('./meshes/monkey.obj').then(mesh => {
    const monkey = new SceneObject(mesh, new Transform(positionOffset, Vector3.zero, scale));
    engine.addSceneObject(monkey);
    models.push(monkey);
    updateModelCount();
    engine.start();
});
