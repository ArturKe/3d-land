import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';

interface intStructure {
  url: string,
  description?: string,
  position: {x: number, y: number, z: number},
  scale: number
}

// const structure: intStructure[] = [
//   {
//     url: 'https://file-server-u2kw.onrender.com/download?name=pine_tree_ver3.glb',
//     description: 'Pine',
//     position: {x: -4, y: 0, z: -3},
//     scale: 0.8
//   },
//   {
//     url: 'https://file-server-u2kw.onrender.com/files/pine_tree_ver3.glb',
//     description: 'Pine2',
//     position: {x: -6, y: 0, z: -3},
//     scale: 1.2
//   },
//   {
//     url: 'https://file-server-u2kw.onrender.com/download?name=cow_edit_ver1.glb',
//     description: 'Pine2',
//     position: {x: -8, y: 0, z: -3},
//     scale: 1
//   },
//   {
//     url: 'https://file-server-u2kw.onrender.com/files/cow_edit_ver1.glb',
//     description: 'Pine2',
//     position: {x: -9, y: 0, z: -3},
//     scale: 0.5
//   }
// ]

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
    // fileLoader2('./venus-ver1_2k.glb', envGroup, {x: 4, y: 0, z: -3}, 0.0007)
    fileLoader2('./venus_stand.glb', envGroup, {x: 4, y: 0, z: -3}, 0.25)
    fileLoader2('./venus_stand.glb', envGroup, {x: 4, y: 0, z: -5}, 0.3)
    // fileLoader('./Venus_LOD_1.glb', envGroup, {x: 3, y: 0, z: -3}, 0.3)
    fileLoader('./building2.glb', envGroup, {x: 10, y: 0, z: -30}, 1)
    // clonizator(10, envGroup)
  
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

    // const grid: any = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
    // grid.position.y = offsetY + 0.03
    // grid.material.opacity = 0.2;
    // grid.material.transparent = true;
    // floorGroup.add(grid)

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

async function fileLoader2 (link:string, parent:THREE.Group, pos: {x: number, y: number, z: number}, scale: number = 1) {
  const loader = new GLTFLoader()

  loader.load(link, async(object) => {
    console.log(object)
    // Собираем все меши в один обьект, имя: mesh
    let meshes: any = {}
    const mainGroup = new THREE.Group

    object.scene.traverse((item: any) => {
      if(item.type === 'Mesh'){
       console.log(item.name)
       meshes[item.name] = item
      }
    })

    console.log(meshes)

    const separatedMeshes = await checkLods(meshes)
    console.log(separatedMeshes)

    if (Object.keys(separatedMeshes.lods).length > 0) applyLods(separatedMeshes.lods, mainGroup, scale)
    // Все что не лоды размещаем по указанным позициям в меше
    if (Object.keys(separatedMeshes.noLods).length > 0) applyPositions(separatedMeshes.noLods, mainGroup, scale)

    mainGroup.position.set(pos.x, pos.y, pos.z)
    parent.add(mainGroup)
    console.log(mainGroup)
    replictor(mainGroup, parent, {x:0, y:0, z:0}, 12)
  })
}

function replictor (object: THREE.Group, parent: THREE.Group,  vector: {x: number, y: number , z: number} = {x:0, y:0, z:0}, count: number = 1, distance: number = 5) {
  const currentPos = object.position.x
  console.log(vector)
  for (let i = 0; i < count; i++) {
      const newObject = object.clone()
      newObject.position.x = currentPos + distance*i
      parent.add(newObject)
  }
}

function applyPositions(files: Object,parent: THREE.Group, scale: number) {
  Object.values(files).forEach((file: Object) => {
    // debugger
    const mesh: any = Object.values(file)[0]
    mesh.scale.set(scale,scale,scale)
    parent.add(mesh)
  })
}

async function checkLods (files: any = {}) {
  let lods: any = {}
  let noLods: any = {}
  Object.keys(files).forEach(key => {
    const isLOD = key.indexOf('LOD')
    if (isLOD > 0) {
      const fileName = key.slice(0, isLOD)
      const lodName = key.slice(isLOD)
      const lodNumber = Number(lodName.slice(3))
      // Сделать что бы лоды были упорядочены по номеру в названии!!!
      console.log(lodNumber)
      lods[fileName] = {...(lods[fileName] ? lods[fileName] : {}), [lodName]: files[key]  }
    } else {
      // Складываем файлы которые не LOD
      noLods[key] = {...(noLods[key] ? noLods[key] : {}), [key]: files[key]  }
    }
  })
  return {lods, noLods}
}

function applyLods (lods:any = {}, parent: THREE.Group, scale: number) {
  Object.keys(lods).forEach(fileName => {
    const lod = new THREE.LOD()
    lod.name = fileName
    let bboxMesh: any = Object.values(lods[fileName])[0]

    Object.values(lods[fileName]).forEach((mesh: any, index) => {
      if (index === 0) bboxMesh = mesh
      mesh.scale.set(scale,scale,scale)
      lod.addLevel( mesh, 10 * (index + 1))
    })
    const lodsCount = Object.keys(lods[fileName]).length + 1
    console.log('LODS count: ' + lodsCount)
    // Boud box for very far LOD
    const bboxMax = bboxMesh.geometry.boundingBox.max
    const bboxMin = bboxMesh.geometry.boundingBox.min
    const bboxSize = {width: bboxMax.x - bboxMin.x, depth: bboxMax.y - bboxMin.y, height: bboxMax.z - bboxMin.z}

    const geometry = new THREE.BoxGeometry( bboxSize.width, bboxSize.height, bboxSize.depth );
    const material = new THREE.MeshStandardMaterial({
      color: 0x858585
    });
    const bbox = new THREE.Mesh( geometry, material );
    bbox.position.y = (bboxSize.height/2)*scale
    bbox.scale.set(scale,scale,scale)

    lod.addLevel( bbox, lodsCount * 10 )
    // lod.position.set(pos.x, pos.y, pos.z)
    console.log(lod)

    // Replicator
    // for (let i = 0; i < 10; i++) {
    //   const newLod = lod.clone()
    //   newLod.position.x = pos.x + 5*i
    //   parent.add(newLod)
    //   console.log(newLod)
    // }
    parent.add(lod)
  })
}

// function traversChildren (object: any, allMeshes: any = {}) {
//   if ( (object.children || []).length >= 1) {
//     object.children.forEach((child: any) => {
//       allMeshes = {...allMeshes, ...traversChildren (child, allMeshes)}
//     })
//   }
//   if (object.type === 'Mesh') {
//     console.log('Here is MEsh')
//     console.log(object.name)
//     allMeshes = {...allMeshes, [object.name]: object}
//     return allMeshes
//   }
//   return allMeshes
// }

// function polyReduce (mesh: THREE.Mesh, count: number = 0.5) {
//   const modifier = new SimplifyModifier();
//   const countDel = Math.floor( mesh.geometry.attributes.position.count * count ); // number of vertices to remove
//   mesh.geometry = modifier.modify( mesh.geometry, countDel ); // count to remove
//   console.log('Verts count after reduce: ' + mesh.geometry.attributes.position.count)
//   const newMat = new THREE.MeshStandardMaterial({
//     color: 0x6b6d70
//   })
//   newMat.flatShading = true
//   mesh.material = newMat
//   return mesh
// }