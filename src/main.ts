import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import * as THREE from 'three';
import { envGen } from './environment';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

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

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 200 );
camera.position.z = 1;
camera.position.y = 0.3;
camera.rotation.x = -0.2

const scene = new THREE.Scene();
setBackgroundColor('#00aaff')  // -!!! for Scene

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

const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
const material = new THREE.MeshNormalMaterial();

const mesh = new THREE.Mesh( geometry, material );
mesh.position.y = 0.2

scene.add( mesh );
scene.add(envGen('Env_1'));
console.log(scene)
const teleportTarget = scene.getObjectByName('floorPlane')


// renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.xr.enabled = true;
renderer.xr.addEventListener( 'sessionstart', () => { console.log(renderer.xr.getReferenceSpace()), baseReferenceSpace = renderer.xr.getReferenceSpace() });
// console.log(renderer.xr)
// console.log(renderer.xr.getControllerGrip(0))
document.body.appendChild( VRButton.createButton( renderer ) );

renderer.setAnimationLoop( animation );
document.body.appendChild( renderer.domElement );

// animation

function animation( time: number ) {
  // console.log(time)

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

  // if (renderer.xr.isPresenting && selectPressed()){
  //   moveDolly(time);
  // }

  // XR ---------- //
  if ( renderer.xr.isPresenting ){
    const session: any = renderer.xr.getSession();
    const inputSources = session.inputSources;

    updateButtonsInfo(inputSources)
    updateControllers()
  }

  ThreeMeshUI.update();
  userText.set({content: `Time: ${Math.round(time)}` + '\n'})

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
    grip.add( controllerModelFactory.createControllerModel( grip ) );
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

let getInputSources = true, type ='', useStandard = false

function updateButtonsInfo (inputSources: any[]) {
  if ( getInputSources ){    
    const info: object[] = [];
    
    inputSources.forEach( inputSource => {
        // debugger
        console.log("Init")
        const gp = inputSource.gamepad;
        const axes = gp.axes;
        const buttons = gp.buttons;
        const mapping = gp.mapping;
        useStandard = (mapping == 'xr-standard');
        const gamepad = { axes, buttons, mapping };
        const handedness = inputSource.handedness;
        const profiles: any[] = inputSource.profiles;
        type = "";
        profiles.forEach( profile => {
            if (profile.indexOf('touchpad')!=-1) type = 'touchpad';
            if (profile.indexOf('thumbstick')!=-1) type = 'thumbstick';
        });
        const targetRayMode = inputSource.targetRayMode;
        info.push({ gamepad, handedness, profiles, targetRayMode });
    });
        
    console.log( JSON.stringify(info) );
    
    getInputSources = false;
} else if (useStandard && type!=""){
    // console.log('Moove')
    let inputState = {
      right: {trigger: false, squize: false, thumbstick_x: 0, thumbstick_y: 0, thumbstick_btn: false},
      left: {}
    }
    inputSources.forEach( inputSource => {
        const gp = inputSource.gamepad;
        const thumbstick = (type=='thumbstick');
        const offset = (thumbstick) ? 2 : 0;
        const btnIndex = (thumbstick) ? 3 : 2;
        const btnPressed = gp.buttons[btnIndex].pressed;
        // const material = (btnPressed) ? materials[1] : materials[0];
        if ( inputSource.handedness == 'right'){
            // rsphere.position.set( 0.5, 1.6, -1 ).add( vec3.set( gp.axes[offset], -gp.axes[offset + 1], 0 ));
            // rsphere.material = material;
            inputState['right'] = {trigger: gp.buttons[0].pressed, squize: gp.buttons[1].pressed, thumbstick_x: gp.axes[offset], thumbstick_y: -gp.axes[offset + 1], thumbstick_btn: btnPressed}
        }else if ( inputSource.handedness == 'left'){
            // lsphere.position.set( -0.5, 1.6, -1 ).add(vec3.set( gp.axes[offset], -gp.axes[offset + 1], 0 ));
            // lsphere.material = material;
            inputState['left'] = {thumbstick_x: gp.axes[offset], thumbstick_y: -gp.axes[offset + 1], thumbstick_btn: btnPressed}
        }
    })
    // console.log(inputState)
    btnInfo.set({content: `Thumbstick_X: ${inputState.right.thumbstick_x.toString().slice(0, 6)}`
       + '\n' + `Thumbstick_Y: ${inputState.right.thumbstick_y.toString().slice(0, 6)}` + '\n' + `Thumbstick_btn: ${inputState.right.trigger}`
       + '\n' + `Trigger: ${inputState.right.trigger}` + '\n' + `Squize: ${inputState.right.thumbstick_btn}` 
      })
}
}