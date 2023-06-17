import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';

interface intStructure {
  url: string,
  description?: string,
  position: {x: number, y: number, z: number},
  scale: number
}

const structure: intStructure[] = [
  {
    url: 'https://file-server-u2kw.onrender.com/download?name=pine_tree_ver3.glb',
    description: 'Pine',
    position: {x: -4, y: 0, z: -3},
    scale: 0.8
  },
  {
    url: 'https://file-server-u2kw.onrender.com/files/pine_tree_ver3.glb',
    description: 'Pine2',
    position: {x: -6, y: 0, z: -3},
    scale: 1.2
  },
  {
    url: 'https://file-server-u2kw.onrender.com/download?name=cow_edit_ver1.glb',
    description: 'Pine2',
    position: {x: -8, y: 0, z: -3},
    scale: 1
  },
  {
    url: 'https://file-server-u2kw.onrender.com/files/cow_edit_ver1.glb',
    description: 'Pine2',
    position: {x: -9, y: 0, z: -3},
    scale: 0.5
  }
]

async function fetchLoader (group: THREE.Group) {
  let response = await fetch('https://file-server-u2kw.onrender.com/map')
  if (response.ok) {
    let json = await response.json()
    massLoader(json, group)
    console.log(json)
  } else {
    alert("Ошибка HTTP: " + response.status)
  }
}

function massLoader(arr: intStructure[], group: THREE.Group) {
  arr.forEach((item: intStructure) => {
    fileLoader(item.url, group, item.position, item.scale)
  })
}
// Функция возвращает группу 3д обьектов с геометрией
export function envGen (nameGroup: string = 'Environment_0') {
    const envGroup = new THREE.Group()
    envGroup.name = nameGroup
  
    envGroup.add(createLights())
    envGroup.add(geometryFloor())
    
    fetchLoader(envGroup)
    // massLoader(structure, envGroup)
    // const url0 ='https://file-server-u2kw.onrender.com/pine_tree_ver3.glb'
    // const url2 = 'http://localhost:3000/download?name=pine_tree_ver3.glb'
    // fileLoader(url0, envGroup, {x: -4, y: 0, z: -3}, 0.8)
    fileLoader('./farm_house_ver1.glb', envGroup, {x: 0, y: 0, z: -3}, 2)
    fileLoader2('./venus-ver1_2k.glb', envGroup, {x: 4, y: 0, z: -3}, 0.0007)
    // fileLoader('./Venus_LOD_1.glb', envGroup, {x: 3, y: 0, z: -3}, 0.3)
    fileLoader('./building2.glb', envGroup, {x: 10, y: 0, z: -30}, 1)
  
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
    const texture = new THREE.TextureLoader().load('/cat-image.jpg')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set( 450, 450 );

    floorMaterial.map = texture

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

  // const modifier = new SimplifyModifier();
  // simplified.geometry = modifier.modify( simplified.geometry, 1000 );

  // const lod = new THREE.LOD();
  // const mesh = new THREE.Mesh( geometry[ i ][ 0 ], material )
  // lod.addLevel( mesh, geometry[ i ][ 1 ] );
  // parent.add(lod)

  loader.load(link, (object) => {
    console.log(object)

    object.scene.position.set(pos.x, pos.y, pos.z)
    object.scene.scale.set(scale,scale,scale)
    object.scene.rotation.y = 1.5
    parent.add(object.scene)
  })
}

function fileLoader2 (link:string, parent:THREE.Group, pos: {x: number, y: number, z: number}, scale: number = 1) {
  const loader = new GLTFLoader();

  // const modifier = new SimplifyModifier();
  // simplified.geometry = modifier.modify( simplified.geometry, 1000 );

  // const mesh = new THREE.Mesh( geometry[ i ][ 0 ], material )
  // lod.addLevel( mesh, geometry[ i ][ 1 ] );
  // parent.add(lod)

  loader.load(link, (object) => {
    console.log(object)
    // traversChildren(object.scene)

    object.scene.traverse((item: any) => {
      // if (child instanceof Mesh) { ... }
      // if((item as THREE.Mesh).isMesh) {
      // if ( (<THREE.Mesh> item).isMesh ) {
      if(item.type === 'Mesh'){
        const lod = new THREE.LOD();
        console.log('Mesh name: ' + item.name)
        console.log('Vetr count: ' + item.geometry.attributes.position.count)
        lod.addLevel( item, 1 );
        item.position.set(pos.x, pos.y, pos.z)
        item.scale.set(scale,scale,scale)
        let i = 0
        const distances = [5, 10, 15]
        const reduceCount = [0, 0.2, 0.5]
        while (i < 3) {
          const mesh = item.clone()
          polyReduce(mesh, reduceCount[i])
          mesh.position.set(pos.x, pos.y, pos.z)
          mesh.scale.set(scale,scale,scale)
          lod.addLevel( mesh, distances[i] );
          parent.add(lod)
          i += 1
        }
        // polyReduce (item)
        item.position.set(pos.x, pos.y, pos.z)
        item.scale.set(scale,scale,scale)
        // item.rotation.y = 1.5
        // parent.add(item)
      }
    })
    // object.scene.position.set(pos.x, pos.y, pos.z)
    // object.scene.scale.set(scale,scale,scale)
    // object.scene.rotation.y = 1.5
    // parent.add(object.scene)
  })
}

// function traversChildren (object: any) {
//   if (object.type === 'Mesh') {
//     console.log('Here is MEsh')
//     console.log(object.name)
//   }
//   if ( (object.children || []).length >= 1) {
//     object.children.forEach((child: any) => traversChildren (child))
//   }
// }

function polyReduce (mesh: THREE.Mesh, count: number = 0.5) {
  const modifier = new SimplifyModifier();
  const countDel = Math.floor( mesh.geometry.attributes.position.count * count ); // number of vertices to remove
  mesh.geometry = modifier.modify( mesh.geometry, countDel ); // count to remove
  console.log('Verts count after reduce: ' + mesh.geometry.attributes.position.count)
  const newMat = new THREE.MeshStandardMaterial({
    color: 0x6b6d70
  })
  newMat.flatShading = true
  mesh.material = newMat
  return mesh
}