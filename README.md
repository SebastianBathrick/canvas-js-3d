# canvas-js-3d

A lightweight, dependency‑free 3D wireframe + flat‑shaded renderer built on the HTML Canvas API.

Great for learning, 3D webpage GUIs, small browser games (especially with synthwave/arcade visuals), and experimentation.

### Live Demo: [https://sebastianbathrick.github.io/canvas-js-3d/](https://sebastianbathrick.github.io/canvas-js-3d/)
</br>

# What This Library Is (and Isn’t)

### canvas-js-3d is a small 3D library that:
* Projects real 3D geometry to a 2D canvas
* Renders edges, filled faces, or both
* Loads Wavefront OBJ meshes

### It intentionally:
* Uses no WebGL
* Is not for rendering highly detailed visuals
* Has no dependencies

# Features

### Rendering
* Wireframe rendering (edges only)
* Depth sorting (using painter’s algorithm)
* Flat-shaded face colors (solid objects/non-wireframe)
* Back-face culling
* Edge color gradients
* Bloom
* Distance‑based fog (rendered per-face)
* Background color or vertical gradient
* FPS counter

### Scene & Math

* Vector3 + Vector2 Math
* Transform with position/rotation/scale
* Scene containing SceneObjects, each with their own mesh, material, & transform
* Camera with adjustable FOV and transform

### Assets

* Wavefront OBJ loading (vertices + faces)
* Load from URL, File, file dialog, or raw text

# Quick Start

### Installation
```powershell
npm install canvas-js-3d
```

### index.html
```html
<!DOCTYPE html>
<html>
    <head>
        <script type="importmap">
        {
            "imports": {
              "canvas-js-3d": "./node_modules/canvas-js-3d/src/index.js"
            }
        }
        </script>
    </head>
    <body>
      <canvas id="canvas" width="800" height="600"></canvas>
      <script type="module" src="app.js"></script>
    </body>
</html>
```

### app.js
```javascript
import { Engine, Mesh, SceneObject, Transform, Vector3, Material } from 'canvas-js-3d';

const canvas = document.getElementById('canvas');
const engine = new Engine(canvas);

// Define the geometry of a cube (or load a .obj file via WavefrontMeshConverter)
const vertices = [
new Vector3(-1, -1, -1),  // 0: back-bottom-left
new Vector3( 1, -1, -1),  // 1: back-bottom-right
new Vector3( 1,  1, -1),  // 2: back-top-right
new Vector3(-1,  1, -1),  // 3: back-top-left
new Vector3(-1, -1,  1),  // 4: front-bottom-left
new Vector3( 1, -1,  1),  // 5: front-bottom-right
new Vector3( 1,  1,  1),  // 6: front-top-right
new Vector3(-1,  1,  1)  // 7: front-top-left
];

const faces = [
[1, 0, 3, 2],  // back
[4, 5, 6, 7],  // front
[0, 4, 7, 3],  // left
[1, 2, 6, 5],  // right
[3, 7, 6, 2],  // top
[0, 1, 5, 4],  // bottom
];

const mesh = new Mesh(vertices, faces);

const cubeSceneObj = new SceneObject(
    mesh,
    new Transform(
        new Vector3(0, 0, 5), // Position
        Vector3.zero(), // Rotation (in radians)
        Vector3.one() // Scale
    ),
    new Material(
        '#ffffff', // Edge color
        null, // Optional gradient color (ex. '#0000ff' for blue)
        '#333333' // Optional face color (null for wireframe)
));

// Smoothly rotate the cube (gets called each frame)
engine.onFrameUpdate = (deltaTime) => {
    // deltaTime = time since last frame
    cubeSceneObj.transform.rotate(new Vector3(0, deltaTime, 0));
};

engine.scene.addSceneObject(cubeSceneObj);
engine.start(); 
```
Run a dev server:
```powershell
npx http-server -c-1
```
> [!NOTE]
> This library uses native ES modules. You must run it from a local server (not file://).

# Feature Usage

These snippets assume you already have an Engine, a SceneObject called cubeSceneObj, and a running render loop. They’re meant to be drop-in additions to the minimal setup above.

### Depth Sorting (Solid Meshes)
```javascript
engine.isDepthSorting = true; // Already enabled by default
```

### Back-Face Culling
```javascript
engine.camera.isBackFaceCulling = true; // Already enabled by default
```

### Camera Transform
```javascript
engine.camera.transform.setPosition(0, 0, -3);
engine.camera.transform.setRotation(0, 0, 0); // in radians
```

### Camera Field of View (FOV)
```javascript
engine.camera.setFov(90); // 90 degrees (60 degrees by default)
```

### Background Color Versus Gradient
```javascript
// Solid color
engine.backgroundColor = '#add8e6';
engine.backgroundGradientColor = null;

// Vertical gradient
engine.backgroundColor = '#000000';
engine.backgroundGradientColor = '#1a1a2e';
```

### Default Edge Color (Fallback)
```javascript
engine.defaultEdgeColor = '#00ff00';
```

#### Materials: Edges, Gradients, Faces
```javascript
// Edges only
cubeSceneObj.material = new Material('#ffffff');

// Gradient edges
cubeSceneObj.material = new Material('#ff00ff', '#00ffff');

// Face fill (depth sorting must be enabled)
engine.isDepthSorting = true;

// Swap material before/after/during runtime
cubeSceneObj.material = new Material('#ff00ff', '#00ffff', '#222222');
```

### Fog
```javascript
engine.depthFog = {
    enabled: true,
    color: '#000000',
    near: 5,
    far: 40
};
```

### Bloom
```javascript
engine.bloom = {
    enabled: true,
    blur: 5,
    color: null // null = use edge color
};
```

### FPS Counter
```javascript
engine.isFrameRateCounter = true;
engine.debugTextColor = '#ffffff';
```

### Screen Resize Handling (Pixels)
```javascript
import { Vector2 } from 'canvas-js-3d';

engine.screenSize = new Vector2(
    500,
    500
);
```

### Loading an OBJ Mesh
```javascript
import { WavefrontMeshConverter } from 'canvas-js-3d';

const mesh2 = await WavefrontMeshConverter.fromUrl('./model.obj');

const obj = new SceneObject(
    mesh2,
    new Transform(new Vector3(4, 0, 4), Vector3.zero(), Vector3.one()),
    new Material('#ffffff', null, '#222222')
);

engine.scene.addSceneObject(obj);
```

Supported:
* WavefrontMeshConverter.fromUrl(url)
* WavefrontMeshConverter.fromFile(file)
* WavefrontMeshConverter.fromFileDialog()
* WavefrontMeshConverter.fromText(objString)

Only vertex positions and face indices are parsed. Normals and UVs are ignored.

# Directory Structure
```
src/
├─ math/              # Vectors & transform math
├─ core/              # Scene, mesh, engine, material, scene object
├─ rendering/         # Camera, renderer, post effects
└─ wavefront-loading/ # OBJ loader pipeline
```

# License

MIT © 2026 Sebastian Bathrick
