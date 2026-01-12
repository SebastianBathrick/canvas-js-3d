import { Engine, Mesh, SceneObject, Transform, Vector3, Vector2 } from '../src/index.js';

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
const cube = new SceneObject(mesh, new Transform(new Vector3(0, 0, 5), new Vector3(0.5, 0.8, 0.3), 1));

engine.addSceneObject(cube);
engine.onUpdate = (dt) => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    engine.setScreenSize(new Vector2(width, height));
    
    cube.transform.rotation = cube.transform.rotation.getTranslated(
        new Vector3(dt * .25, dt, 0)
    );
};
engine.start();