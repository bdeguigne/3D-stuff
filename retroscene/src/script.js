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
let sphere, camera, controls, loader, plane, particles, text, sound;

function init() {

    // Lights
    camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 0.1, 1000);
    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 0
    camera.rotation.y = 0.45


    console.log("CAMERA POS", camera.position);
    scene.add(camera)

    // Controls
    // controls = new OrbitControls(camera, canvas)
    // controls.enableDamping = true

    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true
    })
    renderer.setClearColor(0x322441, 0.5);
    // renderer.setClearColor(0xffffff);

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // renderer.toneMappingExposure = 1;
    renderer.toneMapping = THREE.ReinhardToneMapping;

    const guiController = {
        positionX: 0,
        positionY: 0.5,
        positionZ: 0,
        rotationX: 0,
        rotationY: 4.7,
        rotationZ: 0,
        planePosX: 40
    };

    camera.position.x = guiController.positionX
    camera.position.y = guiController.positionY
    camera.position.z = guiController.positionZ
    camera.rotation.x = guiController.rotationX
    camera.rotation.y = guiController.rotationY
    camera.rotation.z = guiController.rotationZ

    if (plane) {
        plane.position.x = guiController.planePosX
    }

    const listener = new THREE.AudioListener();
    camera.add(listener);

    sound = new THREE.Audio(listener);


    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('/assets/space_echo.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        // sound.play();
    });

    renderer.render(scene, camera);




    // initSky();
    // initGUI();
    loadAssets();
    // initText();
    initParticles();
}

function initText() {
    const loader = new THREE.FontLoader();

    loader.load('assets/oswald.json', function (font) {

        const textGeo = new THREE.TextGeometry('WELCOME', {
            font: font,
            size: 0.2,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 1.5,
            bevelOffset: 0,
            bevelSegments: 5
        });

        const materials = [
            new THREE.MeshPhongMaterial({ color: 0x5e5587, flatShading: false, emissive: 0xffffff }), // front
        ];

        text = new THREE.Mesh(textGeo, materials);

        text.rotation.y = 17.2;

        text.position.x = 2;
        text.position.z = -0.5;
        text.position.y = 0.3;

        scene.add(text);
    });


}

// function initSky() {

//     // Add Sky
//     sky = new Sky();
//     sky.scale.setScalar(450000);
//     // scene.add(sky);

//     sun = new THREE.Vector3();

//     /// GUI

//     const effectController = {
//         turbidity: 20,
//         rayleigh: 0,
//         mieCoefficient: 0.017,
//         mieDirectionalG: 0.854,
//         inclination: 0, // elevation / inclination
//         azimuth: 0.4857, // Facing front,
//         exposure: 1
//     };

//     function guiChanged() {

//         const uniforms = sky.material.uniforms;
//         uniforms["turbidity"].value = effectController.turbidity;
//         uniforms["rayleigh"].value = effectController.rayleigh;
//         uniforms["mieCoefficient"].value = effectController.mieCoefficient;
//         uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

//         const theta = Math.PI * (effectController.inclination - 0.5);
//         const phi = 2 * Math.PI * (effectController.azimuth - 0.5);

//         sun.x = Math.cos(phi);
//         sun.y = Math.sin(phi) * Math.sin(theta);
//         sun.z = Math.sin(phi) * Math.cos(theta);

//         uniforms["sunPosition"].value.copy(sun);

//         renderer.toneMappingExposure = effectController.exposure;

//         renderer.render(scene, camera);

//     }

//     gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged);
//     gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
//     gui.add(effectController, "mieCoefficient", 0.0, 0.1, 0.001).onChange(guiChanged);
//     gui.add(effectController, "mieDirectionalG", 0.0, 1, 0.001).onChange(guiChanged);
//     gui.add(effectController, "inclination", 0, 1, 0.0001).onChange(guiChanged);
//     gui.add(effectController, "azimuth", 0, 1, 0.0001).onChange(guiChanged);
//     gui.add(effectController, "exposure", 0, 1, 0.0001).onChange(guiChanged);

//     guiChanged();

// }

function initGUI() {
    const guiController = {
        positionX: 0,
        positionY: 0.5,
        positionZ: 0,
        rotationX: 0,
        rotationY: 4.7,
        rotationZ: 0,
        planePosX: 40
    };


    function guiChanged() {

        camera.position.x = guiController.positionX
        camera.position.y = guiController.positionY
        camera.position.z = guiController.positionZ
        camera.rotation.x = guiController.rotationX
        camera.rotation.y = guiController.rotationY
        camera.rotation.z = guiController.rotationZ

        if (plane) {

            plane.position.x = guiController.planePosX
        }

        // renderer.render(scene, camera);
    }

    gui.add(guiController, "positionX").onChange(guiChanged);
    gui.add(guiController, "positionY").onChange(guiChanged);
    gui.add(guiController, "positionZ").onChange(guiChanged);
    gui.add(guiController, "rotationX").onChange(guiChanged);
    gui.add(guiController, "rotationY").onChange(guiChanged);
    gui.add(guiController, "rotationZ").onChange(guiChanged);
    gui.add(guiController, "planePosX").onChange(guiChanged);

    guiChanged();
}

function initParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    const sprite = new THREE.TextureLoader().load('/assets/particle.png');

    for (let i = 0; i < 5000; i++) {

        const x = 2000 * Math.random() - 1000;
        const y = 2000 * Math.random() - 1000;
        const z = 2000 * Math.random() - 1000;

        vertices.push(x, y, z);

    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true });
    material.color.setHSL(1.0, 0.3, 0.7);

    particles = new THREE.Points(geometry, material);

    scene.add(particles);
}

function loadModel(path, pos, isSun) {
    var model;

    loader.load(path, function (gltf) {

        gltf.parser.getDependencies("material").then((materials) => {
            console.log("MATERIALS = ", materials);
        });

        model = gltf.scene;

        if (pos) {
            plane = model;
            model.position.x = pos;
        }
        if (isSun) {
            sun = model
        }

        // model.rotation.y = 0;

        scene.add(model);


    }, function (xhr) {
        console.log(xhr);
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) {

        console.error(error);

    });
}

function loadAssets() {
    loader = new GLTFLoader();

    loadModel("/assets/models/retrowave loop plane.glb");
    loadModel("/assets/models/retrowave loop plane.glb", 32);
    loadModel("/assets/models/retrowave loop plane.glb", 64);
    loadModel("/assets/models/retrowave loop plane.glb", 96);
    loadModel("/assets/models/retrowave loop plane.glb", 128);
    loadModel("/assets/models/retrowave loop sun.glb", null, true);
    console.log("PLANE", plane);
    // plane.rotation.x = 90;

}

function initPostProcessing() {
    var pixelRatio = renderer.getPixelRatio();

    // FXAA
    var fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.uniforms['resolution'].value.x = 1 / (window.innerWidth * (pixelRatio));
    fxaaPass.uniforms['resolution'].value.y = 1 / (window.innerWidth * (pixelRatio));

    //Bloom
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.2;
    bloomPass.strength = 2;
    bloomPass.radius = 1;
    bloomPass.renderToScreen = true
    // bloomPass.basic.map.encoding = THREE.GammaEncoding

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
// gui = new dat.GUI()

// Canvas
canvas = document.querySelector('canvas.webgl')

// Scene
scene = new THREE.Scene()
scene.background = new THREE.Color(0x322441);
scene.fog = new THREE.Fog(0x5e5587, 0, 160);

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

document.addEventListener("mousemove", onDocumentMouseMove);

document.body.addEventListener('click', () => sound.play(), true); 

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

const windowX = window.innerWidth / 2;
const windowY = window.innerHeight / 2;

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowX);
    mouseY = (event.clientY - windowY);
}
// scene.environment = pmremGenerator.fromScene(scene).texture;

const tick = () => {
    window.requestAnimationFrame(tick)

    const time = Date.now() * 0.00005;

    targetX = mouseX * .001;
    targetY = mouseY * .001;

    camera.position.x += 0.05
    particles.position.x += 0.05
    // if (sun && text) {
    // text.position.x += 0.05
    if (sun) {
        sun.position.x += 0.05
    }
    if (camera.position.x >= 32) {
        // text.position.x = 2;
        particles.position.x = 0;
        camera.position.x = 0;
        sun.position.x = 0;
    }
    // }

    camera.rotation.z += 0.1 * (targetX - camera.rotation.z);
    camera.rotation.x += 0.1 * (targetX - camera.rotation.z);
    camera.rotation.y += 0.15 * (targetX - camera.rotation.z);

    const h = (360 * (1.0 + time) % 360) / 360;
    scene.fog.color.setHSL(h, 0.5, 0.5);

    composer.render();

    // Call tick again on the next frame
}



// function render() {
//     window.requestAnimationFrame(render)

//     camera.position.x += 0.05
//     particles.position.x += 0.05
//     if (sun) {
//         sun.position.x += 0.05
//         if (camera.position.x >= 32 && sun.position.x >= 32) {
//             particles.position.x = 0;
//             camera.position.x = 0;
//             sun.position.x = 0;
//         }
//     }


//     // console.log(camera.position.x);


//     composer.render();

//     // renderer.render();


//     // controls.update()
// }

tick()
// render()