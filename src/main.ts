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

  if (renderer.xr.isPresenting && selectPressed()){
    moveDolly(time);
  }

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
let dolly = new THREE.Object3D(  );
dolly.position.set(0, 0, 10);
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

// let controllers = buildControllers(dolly);
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

// ----------------------------------------------- Dolly ----------------------------- //

function selectPressed(){
  return ( controllers !== undefined && (controllers[0].userData.selectPressed || controllers[1].userData.selectPressed) );    
}


function moveDolly(dt: number){
  // if (this.proxy === undefined) return;
  
  // const wallLimit = 1.3;
  const speed = 0.000002;
  let pos = dolly.position.clone();
  pos.y += 1;
  
  let dir = new THREE.Vector3();
  //Store original dolly rotation
  
  const quaternion = dolly.quaternion.clone();

  //Get rotation for movement from the headset pose
  let qt = new THREE.Quaternion
  // dolly.quaternion.copy(dummyCam.getWorldQuaternion(qt));
  dummyCam.getWorldQuaternion(qt)
  dolly.quaternion.copy(qt);
  dolly.getWorldDirection(dir);
  // dir.negate();
  // raycaster.set(pos, dir);

  // let blocked = false;

  // let intersect = this.raycaster.intersectObject(this.proxy);
  // if (intersect.length>0){
  //     if (intersect[0].distance < wallLimit) blocked = true;
  // }


  dolly.translateZ(-dt*speed);
  pos = dolly.getWorldPosition( origin );

  //cast left
  // dir.set(-1,0,0);
  // dir.applyMatrix4(dolly.matrix);
  // dir.normalize();
  // this.raycaster.set(pos, dir);

  // intersect = this.raycaster.intersectObject(this.proxy);
  // if (intersect.length>0){
  //     if (intersect[0].distance<wallLimit) this.dolly.translateX(wallLimit-intersect[0].distance);
  // }

  //cast right
  // dir.set(1,0,0);
  // dir.applyMatrix4(dolly.matrix);
  // dir.normalize();
  // this.raycaster.set(pos, dir);

  // intersect = this.raycaster.intersectObject(this.proxy);
  // if (intersect.length>0){
  //     if (intersect[0].distance<wallLimit) this.dolly.translateX(intersect[0].distance-wallLimit);
  // }

  //cast down
  // dir.set(0,-1,0);
  // pos.y += 1.5;
  // this.raycaster.set(pos, dir);
  
  // intersect = this.raycaster.intersectObject(this.proxy);
  // if (intersect.length>0){
  //     this.dolly.position.copy( intersect[0].point );
  // }

  // //Restore the original rotation
  dolly.quaternion.copy( quaternion );
}