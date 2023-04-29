import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import * as THREE from 'three';
import { envGen } from './environment';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100 );
camera.position.z = 1;
camera.position.y = 0.3;
camera.rotation.x = -0.2

const scene = new THREE.Scene();
setBackgroundColor('#00aaff')  // -!!! for Scene

const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh( geometry, material );
mesh.position.y = 0.2

scene.add( mesh );
scene.add(envGen('Env_1'));
console.log(scene)

// renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.xr.enabled = true;
document.body.appendChild( VRButton.createButton( renderer ) );

renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );

// animation

function animation( time: number ) {
  // console.log(time)

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	renderer.render( scene, camera );

}

// Нужен параметр текущего окружения, который можно перезаписывать. currentEnvironment
// --------------------------//

function setBackgroundColor (bgColor: string | number) {
  scene.background = new THREE.Color(bgColor);
  scene.fog = new THREE.FogExp2(bgColor, 0.01);
}

// const listEnvs = ['Env_1', 'Env_2', 'Env_3']
// console.log(scene.getObjectByName('Env_1'))

// // Меняет окружение
// function envManager (newEnv: THREE.Group) {
//   // Удалить текущую группу
//   const curentEnv = newEnv
// }

// --------------------------------------------------- //
function onSelectStart() {    
  // this.userData.selectPressed = true;
  // console.log(event)
}

function onSelectEnd() {
  // this.userData.selectPressed = false;
  // console.log(event)
}

// let controllers = buildControllers(dolly);
let controllers = buildControllers();


controllers.forEach((controller) => {
  controller.addEventListener( 'selectstart', onSelectStart);
  controller.addEventListener( 'selectend', onSelectEnd );
});

function buildControllers( parent = scene ){
  debugger
  const controllerModelFactory = new XRControllerModelFactory();
  const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -1 ) ] );

  const line = new THREE.Line( geometry );
  line.scale.z = 0;
  
  const controllers = [];
  
  for(let i=0; i<=1; i++){
    const controller = renderer.xr.getController( i );
    controller.add( line.clone() );
    controller.userData.selectPressed = false;
    parent.add( controller );
    controllers.push( controller );
    
    const grip = renderer.xr.getControllerGrip( i );
    grip.add( controllerModelFactory.createControllerModel( grip ) );
    parent.add( grip );
  }
  
  return controllers;
}