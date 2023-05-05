import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Функция возвращает группу 3д обьектов с геометрией

export function envGen (nameGroup: string = 'Environment_0') {
    const envGroup = new THREE.Group()
    envGroup.name = nameGroup
  
    envGroup.add(createLights())
    envGroup.add(geometryFloor())
    
    fileLoader('./farm_house_ver1.glb', envGroup, {x: 0, y: 0, z: -3}, 2)
    fileLoader('./venus-ver1_2k.glb', envGroup, {x: 4, y: 0, z: -3}, 0.3)
    // fileLoader('./Venus_LOD_1.glb', envGroup, {x: 3, y: 0, z: -3}, 0.3)
  
    return envGroup
  }
  
  function createLights () {
    const lights = new THREE.Group()
    lights.name = 'Lights'
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.7);
    lights.add(ambient)

    const light = new THREE.DirectionalLight(0xFFFFFF, 2);
    light.position.set( 0, 1, 10);
    light.rotation.y = 1;
    lights.add(light);
  
    return lights
  }
  
  function geometryFloor () {
    const floorGroup = new THREE.Group()
    floorGroup.name = 'floor'
    const offsetY = 0
    const floorGeometry = new THREE.PlaneGeometry( 500, 500 );
    const floorMaterial = new THREE.MeshStandardMaterial( {
        color: 0xeeeeee,
        roughness: 1.0,
        metalness: 0.0
    } );
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.name = 'floorPlane'
    floor.rotation.x = - Math.PI / 2;
    floor.position.y = offsetY;
    floor.receiveShadow = true;
    floorGroup.add( floor );
  
    // Grid -------------------//
    // const grid = new THREE.GridHelper(500,100)


    var grid: any = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
    grid.position.y = offsetY + 0.03
    grid.material.opacity = 0.2;
    grid.material.transparent = true;

    floorGroup.add(grid)
    return floorGroup
  }		
  
  // const ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
  // ground.rotation.x = - Math.PI / 2;
  // this.scene.add( ground );

function fileLoader (link:string, parent:THREE.Group, pos: {x: number, y: number, z: number}, scale: number = 1) {
  const loader = new GLTFLoader();
  loader.load(link, (object) => {
    console.log(object)
    object.scene.position.set(pos.x, pos.y, pos.z)
    object.scene.scale.set(scale,scale,scale)
    object.scene.rotation.y = 1.5
    parent.add(object.scene)
  })
}