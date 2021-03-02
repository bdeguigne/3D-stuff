import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import Stats from '/jsm/libs/stats.module.js';
import { GLTFLoader } from '/jsm/loaders/GLTFLoader.js';

const container = document.querySelector('#scene-container');

const scene = new THREE.Scene();


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();

const light = new THREE.AmbientLight( 0xffffff, 1); 
scene.add( light );

const dirLight = new THREE.DirectionalLight( 0xFFFFFF, 15 );
scene.add( dirLight );

const hemisLight = new THREE.HemisphereLight( 0xffe500, 0x080820, 10 );
scene.add( hemisLight );

const pointLight = new THREE.PointLight( 0x8034f9, 15, 100 );
pointLight.position.set( 0, 5, 0 );
scene.add( pointLight );
const sphereSize = 1; const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize ); scene.add( pointLightHelper );

const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 100, 1000, 100 );
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
const spotLightHelper = new THREE.SpotLightHelper( spotLight );
scene.add( spotLightHelper );

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
    render();
}, false);

const stats = Stats();
document.body.appendChild(stats.dom);

var animate = function () {
    requestAnimationFrame(animate);
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    // controls.update();
    render();
    // stats.update();
};

function render() {
    renderer.render(scene, camera);
}

container.append(renderer.domElement);

animate();
render();