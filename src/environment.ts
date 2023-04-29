import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Функция возвращает группу 3д обьектов с геометрией

export function envGen (nameGroup: string = 'Environment_0') {
    const envGroup = new THREE.Group()
    envGroup.name = nameGroup
  
    envGroup.add(createLights())
    envGroup.add(geometryFloor())
    const loader = new GLTFLoader();

    loader.load('./farm_house_ver1.glb', (object) => {
      console.log(object)
      object.scene.position.z = -3
      object.scene.scale.set(2,2,2)
      object.scene.rotation.y = 1.5
      envGroup.add(object.scene)
    })
  
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
    floor.rotation.x = - Math.PI / 2;
    floor.position.y = offsetY;
    floor.receiveShadow = true;
    floorGroup.add( floor );
  
    // Grid -------------------//
    const grid = new THREE.GridHelper(500,100)
    grid.position.y = offsetY + 0.02
    floorGroup.add(grid)
    return floorGroup
  }