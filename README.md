# canvas-js-3d

A lightweight 3D graphics library that uses the Canvas API for wireframe rendering. Zero dependencies, pure vanilla JavaScript.

## Features

- **Pure JavaScript** - No external dependencies
- **ES6 Modules** - Clean, modular architecture
- **Wavefront OBJ Loading** - Import 3D models from .obj files
- **Wireframe Rendering** - Canvas 2D-based edge rendering
- **Transform System** - Position, rotation, and scale
- **Frame Update Hook** - Per-frame logic with delta-time for framerate-independent animations
- **Scene Object System** - Manage multiple meshes with independent transforms

<img alt="Wireframe geometry rotating" src=".github/images/demo.gif" />

## Quick Start

### Installation

```bash
npm install canvas-js-3d
```

### Setup (No Bundler Required)

This library works with ES6 modules and requires an import map to resolve the package without a bundler.

Create your HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>canvas-js-3d Example</title>
    <script type="importmap">
    {
      "imports": {
        "canvas-js-3d": "./node_modules/canvas-js-3d/src/index.js"
      }
    }
    </script>
</head>
<body>
    <canvas id="canvas" width="800" height="800"></canvas>
    <script type="module" src="./app.js"></script>
</body>
</html>
```

**Important**: You must run a local server. The library won't work if you open the HTML file directly with `file://`. Use the included dev server:

```bash
npm run dev
```

Then open `http://localhost:8080` in your browser.

### Tutorial: Create a Rotating Cube

Create `app.js`:

```javascript
import { Engine, Mesh, SceneObject, Transform, Vector3 } from 'canvas-js-3d';

const canvas = document.getElementById('canvas');
const engine = new Engine(canvas, 'cyan', 'black');

// Define vertices for a cube
const vertices = [
    new Vector3(-1, -1, -1),  // 0: back-bottom-left
    new Vector3( 1, -1, -1),  // 1: back-bottom-right
    new Vector3( 1,  1, -1),  // 2: back-top-right
    new Vector3(-1,  1, -1),  // 3: back-top-left
    new Vector3(-1, -1,  1),  // 4: front-bottom-left
    new Vector3( 1, -1,  1),  // 5: front-bottom-right
    new Vector3( 1,  1,  1),  // 6: front-top-right
    new Vector3(-1,  1,  1),  // 7: front-top-left
];

// Define faces as arrays of vertex indices
const faceIndices = [
    [0, 1, 2, 3],  // back
    [4, 5, 6, 7],  // front
    [0, 4, 7, 3],  // left
    [1, 5, 6, 2],  // right
    [3, 2, 6, 7],  // top
    [0, 1, 5, 4],  // bottom
];

const mesh = new Mesh(vertices, faceIndices);
const cube = new SceneObject(mesh, new Transform(new Vector3(0, 0, 5), 0, 1));

engine.addSceneObject(cube);
engine.onUpdate = (dt) => { cube.transform.rotation += dt; };
engine.start();
```

### Tutorial: Load and Render an OBJ

Here's an example that loads a 3D model from an OBJ file:

```javascript
// app.js
import { Engine, SceneObject, Transform, Vector3, WavefrontMeshConverter } from 'canvas-js-3d';

// Get canvas and create engine with foreground/background colors
const canvas = document.getElementById('canvas');
const engine = new Engine(canvas, 'green', 'black');

// Load an OBJ mesh from URL
const mesh = await WavefrontMeshConverter.fromUrl('./model.obj');

// Create a scene object with position, rotation, and scale
const obj = new SceneObject(
    mesh,
    new Transform(new Vector3(0, 0, 5), 0, 1)  // position, rotation, scale
);

// Add to engine
engine.addSceneObject(obj);

// Animate: rotate the object each frame
engine.onUpdate = (deltaTime) => {
    obj.transform.rotation += Math.PI * 0.5 * deltaTime;
};

// Start the render loop
engine.start();
```

Make sure `model.obj` is in the same directory as your HTML file, or adjust the path accordingly.

### Module Structure

```
src/
├── index.js                 # Main entry point
├── math/                    # Vector and transform math
│   ├── vector2.js
│   ├── vector3.js
│   └── transform.js
├── core/                    # Scene data structures and engine
│   ├── mesh.js
│   ├── sceneObject.js
│   └── engine.js
├── rendering/               # Display components
│   ├── camera.js
│   └── renderer.js
└── wavefront-loading/       # OBJ file loading
    ├── index.js
    ├── wavefront-mesh-converter.js
    ├── wavefront-file-loader.js
    ├── wavefront-lexer.js
    └── wavefront-parser.js
```

## Usage

### Engine

The main render loop and scene manager.

```javascript
const engine = new Engine(canvas, 'white', 'black');  // canvas, fgColor, bgColor

engine.addSceneObject(obj);      // Add object to scene
engine.removeSceneObject(obj);   // Remove object from scene

engine.onUpdate = (deltaTime) => {
    // Called every frame with time since last frame (in seconds)
};

engine.start();  // Start render loop
engine.stop();   // Stop render loop
```

### SceneObject

Combines a Mesh with a Transform for positioning in the scene.

```javascript
const obj = new SceneObject(mesh, transform);

obj.mesh;       // The Mesh geometry
obj.transform;  // The Transform (position, rotation, scale)
```

### Transform

Defines position, rotation, and scale. Transform order: scale → rotate → translate.

```javascript
const transform = new Transform(
    new Vector3(0, 0, 5),  // position
    0,                      // rotation (radians, XZ plane)
    1.0                     // scale (uniform)
);

transform.position = new Vector3(1, 2, 3);
transform.rotation += Math.PI * 0.5;
transform.scale = 2.0;
```

### Vector3

Immutable-style 3D vector math. Methods return new instances.

```javascript
const v = new Vector3(1, 2, 3);

v.getTranslated(new Vector3(1, 0, 0));  // Returns new Vector3(2, 2, 3)
v.getScaled(2);                          // Returns new Vector3(2, 4, 6)
v.getRotatedXZ(Math.PI / 2);            // Rotate around Y axis
```

### WavefrontMeshConverter

Load OBJ files from various sources.

```javascript
// From URL
const mesh = await WavefrontMeshConverter.fromUrl('./model.obj');

// From File object (e.g., from <input type="file">)
const mesh = await WavefrontMeshConverter.fromFile(file);

// From file dialog (opens browser file picker)
const mesh = await WavefrontMeshConverter.fromFileDialog();

// From raw OBJ text
const mesh = WavefrontMeshConverter.fromText(objString);
```

## Troubleshooting

### "Failed to resolve module specifier" error

Make sure you have:
1. The import map in your HTML `<head>` (see Setup section above)
2. `type="module"` on your script tag
3. A local server running (not opening the file with `file://`)

### Canvas is blank

Check that:
1. Your canvas has width and height attributes
2. Objects are positioned at z > 0 (positive z is away from the camera)
3. The scale and rotation values are reasonable
4. `engine.start()` is called

## License

MIT
