import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';


let sky, sun, gui, canvas, scene, sizes, renderer, composer, ssaaRenderPass;
let sphere, camera, controls;

function init() {

    // Lights
    camera = new THREE.PerspectiveCamera(85, sizes.width / sizes.height, 0.1, 1000);
    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 2
    scene.add(camera)

    // Controls
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
    })

    renderer.setClearColor( 0xffffff);

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // renderer.toneMappingExposure = 1;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;


    initSky();
    loadAssets();
}

function initSky() {

    // Add Sky
    sky = new Sky();
    sky.scale.setScalar(450000);
    // scene.add(sky);

    sun = new THREE.Vector3();

    /// GUI

    const effectController = {
        turbidity: 20,
        rayleigh: 0,
        mieCoefficient: 0.017,
        mieDirectionalG: 0.854,
        inclination: 0, // elevation / inclination
        azimuth: 0.4857, // Facing front,
        exposure: 1
    };

    function guiChanged() {

        const uniforms = sky.material.uniforms;
        uniforms["turbidity"].value = effectController.turbidity;
        uniforms["rayleigh"].value = effectController.rayleigh;
        uniforms["mieCoefficient"].value = effectController.mieCoefficient;
        uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

        const theta = Math.PI * (effectController.inclination - 0.5);
        const phi = 2 * Math.PI * (effectController.azimuth - 0.5);

        sun.x = Math.cos(phi);
        sun.y = Math.sin(phi) * Math.sin(theta);
        sun.z = Math.sin(phi) * Math.cos(theta);

        uniforms["sunPosition"].value.copy(sun);

        renderer.toneMappingExposure = effectController.exposure;
        renderer.render(scene, camera);

    }

    gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged);
    gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
    gui.add(effectController, "mieCoefficient", 0.0, 0.1, 0.001).onChange(guiChanged);
    gui.add(effectController, "mieDirectionalG", 0.0, 1, 0.001).onChange(guiChanged);
    gui.add(effectController, "inclination", 0, 1, 0.0001).onChange(guiChanged);
    gui.add(effectController, "azimuth", 0, 1, 0.0001).onChange(guiChanged);
    gui.add(effectController, "exposure", 0, 1, 0.0001).onChange(guiChanged);

    guiChanged();

}

function loadAssets() {
    const loader = new GLTFLoader();

    loader.load("/assets/models/retrowave loop.glb", function (gltf) {

        gltf.scene.layers.set(0);

        gltf.parser.getDependencies("material").then((materials) => {
            console.log("MATERIALS = ", materials);
        });

        scene.add(gltf.scene);

    }, undefined, function (error) {

        console.error(error);

    });

}

function initPostProcessing() {
    var pixelRatio = renderer.getPixelRatio();

    // FXAA
    var fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.uniforms['resolution'].value.x = 1 / (window.innerWidth * (pixelRatio));
    fxaaPass.uniforms['resolution'].value.y = 1 / (window.innerWidth * (pixelRatio));

    //Bloom
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.8;
    bloomPass.radius = 1;
    bloomPass.renderToScreen = true

    composer = new EffectComposer(renderer);
    composer.setPixelRatio(1); // ensure pixel ratio is always 1 for performance reasons
    ssaaRenderPass = new SSAARenderPass(scene, camera);
    composer.addPass(ssaaRenderPass);
    composer.addPass(bloomPass);
}

/**
 * Sizes
 */
sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Debug
gui = new dat.GUI()

// Canvas
canvas = document.querySelector('canvas.webgl')

// Scene
scene = new THREE.Scene()
// scene.background = new THREE.Color( 0x322441);

init();
initPostProcessing();



window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    composer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Animate
 */

const clock = new THREE.Clock()

const pmremGenerator = new THREE.PMREMGenerator(renderer);
// scene.environment = pmremGenerator.fromScene(scene).texture;

// const tick = () => {

//     const elapsedTime = clock.getElapsedTime()

//     // Update objects
//     sphere.rotation.y = .5 * elapsedTime

//     // Update Orbital Controls
//     controls.update()

//     ssaaRenderPass.clearColor = "black";
//     ssaaRenderPass.clearAlpha = 1.0;

//     ssaaRenderPass.sampleLevel = 4;
//     ssaaRenderPass.unbiased = true;

//     // Render
//     // renderer.render(scene, camera)
//     composer.render();

//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }

function render() {
    window.requestAnimationFrame(render)


    composer.render();

    // renderer.render();
    

    controls.update()

}
render()