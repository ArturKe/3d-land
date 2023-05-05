import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import * as THREE from 'three';
import { envGen } from './environment';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { updateButtonsInfo } from './character'

import ThreeMeshUI from 'three-mesh-ui';

let baseReferenceSpace: XRReferenceSpace | null
let userText: any = new ThreeMeshUI.Text({
  content: 'This library supports line break friendly characters',
  fontSize: 0.055
});
let btnInfo: any = new ThreeMeshUI.Text({
  content: '',
  fontSize: 0.065
});

// First Init
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 200 );
camera.position.z = 1;
camera.position.y = 0.3;
camera.rotation.x = -0.2

const scene = new THREE.Scene();
setBackgroundColor('#00aaff')  // -!!! for Scene

// renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.xr.enabled = true;
renderer.xr.addEventListener( 'sessionstart', () => { console.log(renderer.xr.getReferenceSpace()), baseReferenceSpace = renderer.xr.getReferenceSpace() });

// console.log(renderer.xr.getControllerGrip(0))

// / Init


// Scene create ---------------------------------------------------
// Teleport
const marker = new THREE.Mesh(
  // new THREE.CircleGeometry( 0.25, 32 ).rotateX( - Math.PI / 2 ),
  new THREE.TorusGeometry( 0.1, 0.03, 4, 18 ).rotateX( - Math.PI / 2 ), 
  new THREE.MeshBasicMaterial( { color: 0x808080 } )
);
marker.visible = false
scene.add( marker );
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
let INTERSECTION: THREE.Vector3 | undefined
// /Teleport 

function cubeCreate (size: {x: number, y: number, z: number}) {
  const geometry = new THREE.BoxGeometry( size.x, size.y, size.z );
  const material = new THREE.MeshNormalMaterial();
  return new THREE.Mesh( geometry, material );
}

const cube = cubeCreate({x: 0.2, y: 0.2, z: 0.2})
cube.position.y = 0.2
scene.add( cube );

scene.add(envGen('Env_1'));
console.log(scene)
const teleportTarget = scene.getObjectByName('floorPlane')
// Scene create --------------------------------------------------- /

console.log(renderer.info.memory)
console.log(renderer.info.render)

document.body.appendChild( VRButton.createButton( renderer ) );
document.body.appendChild( renderer.domElement );
renderer.setAnimationLoop( animation );


// animation
function animation( time: number ) {
  // console.log(time)

	cube.rotation.x = time / 2000;
	cube.rotation.y = time / 1000;

  // if (renderer.xr.isPresenting && selectPressed()){
  //   moveDolly(time);
  // }

  // Делитель частоты обновления
  // if (!(Math.round(time)%4)) {
  //   console.log('hello')
    // console.log('Triangles: ' + renderer.info.render.triangles)
    // console.log('Calls: ' + renderer.info.render.calls)
  // }

  // XR ---------- //
  if ( renderer.xr.isPresenting ){
    const session: any = renderer.xr.getSession();
    const inputSources = session.inputSources;

    updateControllers()
    
    if (!(Math.round(time)%4)) {
      btnInfo.set({content: updateButtonsInfo(inputSources)})
      userText.set({content: `Time: ${Math.round(time)}` + '\n'})
      ThreeMeshUI.update();
    }
  }
	renderer.render( scene, camera );
}

// Нужен параметр текущего окружения, который можно перезаписывать. currentEnvironment
// --------------------------//

function setBackgroundColor (bgColor: string | number) {
  scene.background = new THREE.Color(bgColor);
  // scene.fog = new THREE.FogExp2(bgColor, 0.01);
  scene.fog = new THREE.Fog( bgColor, 10, 70 );
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
// dolly.position.set(0, 0, 2);
dolly.add( camera );
let dummyCam = new THREE.Object3D();
// camera.add( dummyCam );
scene.add( dolly )
// let origin = new THREE.Vector3(); // For dolly


function onSelectStart(this: any, event: any) {    
  this.userData.selectPressed = true;
  console.log(event)
  console.log(this)
}

function onSelectEnd(this: any) {
  this.userData.selectPressed = false;
  let teleportSpaceOffset: XRReferenceSpace

  // console.log(event)
  if ( INTERSECTION !== undefined ) {
    const offsetPosition = { x: - INTERSECTION.x, y: - INTERSECTION.y, z: - INTERSECTION.z, w: 1 };
    const offsetRotation = new THREE.Quaternion();
    const transform = new XRRigidTransform( offsetPosition, offsetRotation );
    if (baseReferenceSpace !== null) {
      teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace( transform )
      renderer.xr.setReferenceSpace( teleportSpaceOffset );
    }
  } 
}

let controllers = buildControllers(dolly);

controllers.forEach((controller) => {
  controller.addEventListener( 'connected', (e) => {console.log(e)} )
  controller.addEventListener( 'selectstart', onSelectStart);
  controller.addEventListener( 'selectend', onSelectEnd );
});

function buildControllers( parent: THREE.Object3D = scene ){
  // debugger
  const controllerModelFactory = new XRControllerModelFactory();
  const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -1 ) ] );

  const line = new THREE.Line( geometry );
  line.scale.z = 1;
  
  const controllers = [];
  
  for(let i=0; i<=1; i++){
    const controller = renderer.xr.getController( i );
    controller.add( line.clone() );
    if (i === 0) controller.add(dummyCam)
    controller.userData.selectPressed = false;
    parent.add( controller );
    controllers.push( controller );
    
    const grip = renderer.xr.getControllerGrip( i );
    const mesh = cubeCreate({x: 0.02, y: 0.06, z: 0.02})
    mesh.rotation.x = 0.9
    // grip.add( controllerModelFactory.createControllerModel( grip ) );
    grip.add( mesh );
    parent.add( grip );
  }
  
  return controllers;
}

// function selectPressed(){
//   return ( controllers !== undefined && (controllers[0].userData.selectPressed || controllers[1].userData.selectPressed) );    
// }


// function moveDolly(dt: number){
//   const speed = 0.000002;
//   let pos = dolly.position.clone();
//   pos.y += 1;
//   let dir = new THREE.Vector3();

//   //Store original dolly rotation
//   const quaternion = dolly.quaternion.clone();

//   //Get rotation for movement from the headset pose
//   let qt = new THREE.Quaternion
//   dummyCam.getWorldQuaternion(qt)

//   dolly.quaternion.copy(qt);
//   dolly.getWorldDirection(dir);
//   dolly.translateZ(-dt*speed);
//   pos = dolly.getWorldPosition( origin );

//   //Restore the original rotation
//   dolly.quaternion.copy( quaternion );
// }

// ------------------------------------------------------------- UI --------?
const container = new ThreeMeshUI.Block({
  width: 1.2,
  height: 0.8,
  padding: 0.1,
  borderRadius: 0.05,
  // textAlign: 'end',
  // justifyContent: 'end',
  textAlign: 'left',
  fontFamily: './Roboto-msdf.json',
  fontTexture: './Roboto-msdf.png',
 });
 
container.position.set( -2, 1, -2.8 );
container.rotation.x = -0.55;
 

  const text2 = new ThreeMeshUI.Text({
    content: 'This some new text, description.' + '\n',
    fontSize: 0.075
    });

 container.add( userText );
 container.add( text2 );
 container.add( btnInfo );
//  console.log(userText)
 
 // scene is a THREE.Scene (see three.js)
 scene.add( container );
 console.log(container)

 // --------------------------

function updateControllers () {
  INTERSECTION = undefined

  controllers.map(controller => {
    if ( controller.userData.selectPressed === true ) {
        tempMatrix.identity().extractRotation( controller.matrixWorld );

        raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
        raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

        const intersects = raycaster.intersectObjects([teleportTarget ? teleportTarget : new THREE.Object3D]);

        if ( intersects.length > 0 ) {
            INTERSECTION = intersects[ 0 ].point;
        }
    }
  })

  if ( INTERSECTION ) marker.position.copy( INTERSECTION );
  marker.visible = INTERSECTION !== undefined;
}
