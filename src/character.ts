import * as THREE from 'three';

// let baseReferenceSpace: XRReferenceSpace | null
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
let INTERSECTION: THREE.Vector3 | undefined
let controllers: THREE.Group[]
let marker: THREE.Mesh

export function character () {

}

let getInputSources = true, type ='', useStandard = false

export function updateButtonsInfo (inputSources: any[]) {
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
      inputState['right'] = {
        trigger: gp.buttons[0].pressed, 
        squize: gp.buttons[1].pressed, 
        thumbstick_x: gp.axes[offset], 
        thumbstick_y: -gp.axes[offset + 1], 
        thumbstick_btn: btnPressed}
    }else if ( inputSource.handedness == 'left'){
      // lsphere.position.set( -0.5, 1.6, -1 ).add(vec3.set( gp.axes[offset], -gp.axes[offset + 1], 0 ));
      // lsphere.material = material;
      inputState['left'] = {thumbstick_x: gp.axes[offset], thumbstick_y: -gp.axes[offset + 1], thumbstick_btn: btnPressed}
    }
  })
  // console.log(inputState)
  return `Thumbstick_X: ${inputState.right.thumbstick_x.toString().slice(0, 6)}` + '\n' + 
    `Thumbstick_Y: ${inputState.right.thumbstick_y.toString().slice(0, 6)}` + '\n' + 
    `Thumbstick_btn: ${inputState.right.thumbstick_btn}` + '\n' + 
    `Trigger: ${inputState.right.trigger}` + '\n' + 
    `Squize: ${inputState.right.squize}`  
  }
}

export function initControllers (renderer: any, parent: THREE.Scene, camera: THREE.Camera) {

// Teleport
marker = new THREE.Mesh(
// new THREE.CircleGeometry( 0.25, 32 ).rotateX( - Math.PI / 2 ),
new THREE.TorusGeometry( 0.1, 0.03, 4, 18 ).rotateX( - Math.PI / 2 ), 
new THREE.MeshBasicMaterial( { color: 0x808080 } )
);
marker.visible = false
parent.add( marker );

let dolly = new THREE.Object3D(  );
// dolly.position.set(0, 0, 2);
dolly.add( camera );
let dummyCam = new THREE.Object3D();
// camera.add( dummyCam );
parent.add( dolly )
// let origin = new THREE.Vector3(); // For dolly


function onSelectStart(this: any, event: any) {    
  this.userData.selectPressed = true;
  console.log(event)
  console.log(this)
}

function onSelectEnd(this: any) {
  this.userData.selectPressed = false;
//   let teleportSpaceOffset: XRReferenceSpace

  // console.log(event)
  if ( INTERSECTION !== undefined ) {
    // const offsetPosition = { x: - INTERSECTION.x, y: - INTERSECTION.y, z: - INTERSECTION.z, w: 1 };
    // const offsetRotation = new THREE.Quaternion();
    // const transform = new XRRigidTransform( offsetPosition, offsetRotation );
    // if (baseReferenceSpace !== null) {
    //   teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace( transform )
    //   renderer.xr.setReferenceSpace( teleportSpaceOffset );
    // }
    dolly.position.set(INTERSECTION.x, INTERSECTION.y, INTERSECTION.z)
  } 
}

controllers = buildControllers(dolly);

controllers.forEach((controller) => {
  controller.addEventListener( 'connected', (e) => {console.log(e)} )
  controller.addEventListener( 'selectstart', onSelectStart);
  controller.addEventListener( 'selectend', onSelectEnd );
});

function buildControllers( parent: THREE.Object3D ){
  // const controllerModelFactory = new XRControllerModelFactory();
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
    const mesh = cubeCreate({x: 0.02, y: 0.02, z: 0.06})
    // mesh.rotation.x = 0.9
    controller.add(mesh)
    // grip.add( controllerModelFactory.createControllerModel( grip ) );
    // grip.add( mesh );
    parent.add( grip );
  }
  
  return controllers;
}

}

export function updateControllers (teleportTarget: THREE.Object3D) {
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

  function cubeCreate (size: {x: number, y: number, z: number}) {
    const geometry = new THREE.BoxGeometry( size.x, size.y, size.z );
    const material = new THREE.MeshNormalMaterial();
    return new THREE.Mesh( geometry, material );
  }