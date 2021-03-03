import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import Stats from '/jsm/libs/stats.module.js';
import { GLTFLoader } from '/jsm/loaders/GLTFLoader.js';
import { UnrealBloomPass } from '/jsm/postprocessing/UnrealBloomPass.js';
import { RenderPass } from '/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from '/jsm/postprocessing/EffectComposer.js';
import { FXAAShader } from '/jsm/shaders/FXAAShader.js';
import { ShaderPass } from '/jsm/postprocessing/ShaderPass.js';
import { SSAARenderPass } from '/jsm/postprocessing/SSAARenderPass.js';

const container = document.querySelector('#scene-container');

const width = window.innerWidth || 1;
const height = window.innerHeight || 1;
const aspect = width / height;
const devicePixelRatio = window.devicePixelRatio || 1;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(width, height);


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2;


console.log("INNER WIDTH", window.innerWidth);
console.log("INNER HEIGHT", window.innerHeight);
// renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();


const controls = new OrbitControls(camera, renderer.domElement);

var fxaaPass = new ShaderPass(FXAAShader);

var pixelRatio = renderer.getPixelRatio();

console.log("PIXEL RATIO", pixelRatio)

// var uniforms = fxaaPass.material.uniforms;
fxaaPass.uniforms['resolution'].value.x = 1 / (window.innerWidth * (pixelRatio));
fxaaPass.uniforms['resolution'].value.y = 1 / (window.innerWidth * (pixelRatio));

const loader = new GLTFLoader();

// const light = new THREE.AmbientLight( 0xffffff, 1); 
// scene.add( light );

// const dirLight = new THREE.DirectionalLight( 0xFFFFFF, 15 );
// scene.add( dirLight );

// const hemisLight = new THREE.HemisphereLight( 0xffe500, 0x080820, 10 );
// scene.add( hemisLight );

// const pointLight = new THREE.PointLight( 0x8034f9, 15, 100 );
// pointLight.position.set( 0, 5, 0 );
// scene.add( pointLight );
// const sphereSize = 1; const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize ); scene.add( pointLightHelper );

// postprocessing


const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 0.5;
bloomPass.radius = 0;

const composer = new EffectComposer(renderer);
composer.setPixelRatio(1); // ensure pixel ratio is always 1 for performance reasons
const ssaaRenderPass = new SSAARenderPass(scene, camera);
composer.addPass(ssaaRenderPass);
composer.addPass(bloomPass);


loader.load('assets/retrowave loop.glb', function (gltf) {

    scene.add(gltf.scene);

}, undefined, function (error) {

    console.error(error);

});

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({
//     color: 0x00ff00,
//     wireframe: true
// });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);

    render();
}, false);

const stats = Stats();
document.body.appendChild(stats.dom);

var animate = function () {
    requestAnimationFrame(animate);
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    // controls.update();
    ssaaRenderPass.clearColor = "black";
    ssaaRenderPass.clearAlpha = 1.0;

    ssaaRenderPass.sampleLevel = 4;
    ssaaRenderPass.unbiased = true;
    render();
    // stats.update();
};

function render() {
    // renderer.render(scene, camera);
    composer.render();
}

container.append(renderer.domElement);

animate();
render();