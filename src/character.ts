// import * as THREE from 'three';

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