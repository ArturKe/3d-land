import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import * as THREE from 'three';
import { envGen } from './environment';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

import ThreeMeshUI from 'three-mesh-ui';

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

  if (renderer.xr.isPresenting && selectPressed()){
    moveDolly(time);
  }

  ThreeMeshUI.update();

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

// ---------------------------------------- Dolly ------------------------------------------ //
let dolly = new THREE.Object3D(  );
dolly.position.set(0, 0, 2);
dolly.add( camera );
let dummyCam = new THREE.Object3D();
// camera.add( dummyCam );
scene.add( dolly )
let origin = new THREE.Vector3();


function onSelectStart(this: any, event: any) {    
  this.userData.selectPressed = true;
  console.log(event)
}

function onSelectEnd(this: any) {
  this.userData.selectPressed = false;
  // console.log(event)
}

let controllers = buildControllers(dolly);


controllers.forEach((controller) => {
  controller.addEventListener( 'selectstart', onSelectStart);
  controller.addEventListener( 'selectend', onSelectEnd );
});

function buildControllers( parent: THREE.Object3D = scene ){
  // debugger
  const controllerModelFactory = new XRControllerModelFactory();
  const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -1 ) ] );

  const line = new THREE.Line( geometry );
  line.scale.z = 0;
  
  const controllers = [];
  
  for(let i=0; i<=1; i++){
    const controller = renderer.xr.getController( i );
    controller.add( line.clone() );
    if (i === 0) controller.add(dummyCam)
    controller.userData.selectPressed = false;
    parent.add( controller );
    controllers.push( controller );
    
    const grip = renderer.xr.getControllerGrip( i );
    grip.add( controllerModelFactory.createControllerModel( grip ) );
    parent.add( grip );
  }
  
  return controllers;
}

function selectPressed(){
  return ( controllers !== undefined && (controllers[0].userData.selectPressed || controllers[1].userData.selectPressed) );    
}


function moveDolly(dt: number){
  const speed = 0.000002;
  let pos = dolly.position.clone();
  pos.y += 1;
  let dir = new THREE.Vector3();

  //Store original dolly rotation
  const quaternion = dolly.quaternion.clone();

  //Get rotation for movement from the headset pose
  let qt = new THREE.Quaternion
  dummyCam.getWorldQuaternion(qt)

  dolly.quaternion.copy(qt);
  dolly.getWorldDirection(dir);
  dolly.translateZ(-dt*speed);
  pos = dolly.getWorldPosition( origin );

  //Restore the original rotation
  dolly.quaternion.copy( quaternion );
}

// ------------------------------------------------------------- UI --------?
const container = new ThreeMeshUI.Block({
  width: 1.2,
  height: 0.7,
  padding: 0.2,
  fontFamily: './Roboto-msdf.json',
  fontTexture: './Roboto-msdf.png',
 });
 
container.position.set( 0, 1, -1.8 );
container.rotation.x = -0.55;
 
  const text = new ThreeMeshUI.Text({
  content: 'This library supports line break friendly characters',
  fontSize: 0.055
  });
  const text2 = new ThreeMeshUI.Text({
    content: 'This some new text, description.',
    fontSize: 0.075
    });

 container.add( text );
 container.add( text2 );
 
 // scene is a THREE.Scene (see three.js)
 scene.add( container );