import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import * as THREE from 'three';
import { envGen } from './environment';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
// import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
// import { updateButtonsInfo } from './character'
import { initControllers, updateControllers } from './character'

import ThreeMeshUI from 'three-mesh-ui';

// let baseReferenceSpace: XRReferenceSpace | null
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
// setBackgroundColor('#00aaff')  // -!!! for Scene
cubeTextureInit()

// renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.xr.enabled = true;
// renderer.xr.addEventListener( 'sessionstart', () => { console.log(renderer.xr.getReferenceSpace()), baseReferenceSpace = renderer.xr.getReferenceSpace() });

// console.log(renderer.xr.getControllerGrip(0))

// / Init
initControllers(renderer, scene, camera)

// Scene create ---------------------------------------------------

// const raycaster = new THREE.Raycaster();
// const tempMatrix = new THREE.Matrix4();
// let INTERSECTION: THREE.Vector3 | undefined
// /Teleport 

function cubeCreate (size: {x: number, y: number, z: number}) {
  const geometry = new THREE.BoxGeometry( size.x, size.y, size.z );
  // const material = new THREE.MeshNormalMaterial();
  const material = new THREE.MeshStandardMaterial();
  const texture = new THREE.TextureLoader().load('/cat-image.jpg')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set( 2, 2 );

  material.map = texture
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
    // const session: any = renderer.xr.getSession();
    // const inputSources = session.inputSources;

    if (teleportTarget) updateControllers(teleportTarget)
    
    if (!(Math.round(time)%6)) {
      // btnInfo.set({content: updateButtonsInfo(inputSources)})
      // userText.set({content: `Time: ${Math.round(time)}` + '\n'})
      ThreeMeshUI.update();
      // console.log('Triangles: ' + renderer.info.render.triangles)
      // console.log('Calls: ' + renderer.info.render.calls)
    }
  }
	renderer.render( scene, camera );
}

// Нужен параметр текущего окружения, который можно перезаписывать. currentEnvironment
// --------------------------//

function cubeTextureInit() {
  const reflectionCube = new THREE.CubeTextureLoader()
        .setPath('/cube/' )
        .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] )
    reflectionCube.encoding = THREE.sRGBEncoding;

    // scene = new THREE.Scene();
    scene.background = reflectionCube;
  
}


// function setBackgroundColor (bgColor: string | number) {
//   scene.background = new THREE.Color(bgColor);
//   // scene.fog = new THREE.FogExp2(bgColor, 0.01);
//   scene.fog = new THREE.Fog( bgColor, 10, 70 );
// }

// const listEnvs = ['Env_1', 'Env_2', 'Env_3']
// console.log(scene.getObjectByName('Env_1'))

// // Меняет окружение
// function envManager (newEnv: THREE.Group) {
//   // Удалить текущую группу
//   const curentEnv = newEnv
// }

// ---------------------------------------- Dolly ------------------------------------------ //

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


