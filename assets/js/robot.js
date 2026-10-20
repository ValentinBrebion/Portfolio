import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';


const container = document.querySelector('#robot-container');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);

camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

scene.environmentIntensity = 0.6;

scene.add(new THREE.HemisphereLight(0xffffff, 0x888899, 0.4));

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(2, 3, 6);
scene.add(light);

const loader = new GLTFLoader();

loader.load(
  './assets/3d/perso.glb',
  (gltf) => {
    const robot = gltf.scene;
    
    robot.traverse((o) => {
    if (o.isMesh) {
      console.log(o.name, o.material.color.getHexString(), o.material.metalness, o.material.roughness);
    }
  });
    // Ajuster automatiquement la taille du modèle
    const box = new THREE.Box3().setFromObject(robot);
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());

const maxSize = Math.max(size.x, size.y, size.z);
const scale = maxSize > 0 ? 2 / maxSize : 1;

robot.scale.setScalar(scale);
robot.position.copy(center).multiplyScalar(-scale);

// Pivot : permet de tourner le perso autour de son centre
const pivot = new THREE.Group();
pivot.add(robot);
pivot.rotation.y = THREE.MathUtils.degToRad(-180);
scene.add(pivot);

    // Lire la première animation Blender, si disponible
    let mixer;

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(robot);
      mixer.clipAction(gltf.animations[0]).play();
    }

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (mixer) {
        mixer.update(delta);
      }

      renderer.render(scene, camera);
    }

    animate();
  },
  undefined,
  (error) => {
    console.error('Erreur de chargement du robot :', error);
  }
);

window.addEventListener('resize', () => {
  const { clientWidth: w, clientHeight: h } = container;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});