import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.querySelector('#robot-container');
const helperIA = document.querySelector('.helperIA');
let robotPivot;
let robotRotation = -180;
let robotAnimation;
let assistantOpen = false;
const assistantDetails = document.querySelectorAll('.iaDisplay details');

function setRobotRotation(degrees) {
  robotRotation = degrees;
  if (robotPivot) {
    robotPivot.rotation.y = THREE.MathUtils.degToRad(degrees);
  }
}

function updateRobotAnimation() {
  const shouldAnimate = assistantOpen
    && Array.from(assistantDetails).some((details) => details.open);

  helperIA.classList.toggle('robotActive', shouldAnimate);

  if (!robotAnimation) {
    return;
  }

  if (shouldAnimate) {
    if (!robotAnimation.isRunning()) {
      robotAnimation.reset().play();
    }
  } else if (robotAnimation.isRunning()) {
    robotAnimation.stop();
  }
}

document.addEventListener('assistant-visibility-change', (event) => {
  assistantOpen = event.detail.isOpen;
  if (!event.detail.isOpen) {
    setRobotRotation(-180);
  }
  updateRobotAnimation();
});

assistantDetails.forEach((details) => {
  details.addEventListener('toggle', () => {
    if (details.open) {
      helperIA.classList.remove('reduceIa');
      helperIA.classList.add('moveIa');
      setRobotRotation(-150);
    }
    updateRobotAnimation();
  });
});

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

scene.environmentIntensity = 0.9;

scene.add(new THREE.HemisphereLight(0xffffff, 0x888899, 1.5));

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(2, 3, 6);
scene.add(light);

const loader = new GLTFLoader();

loader.load(
  './assets/3d/perso.glb',
  (gltf) => {
    const robot = gltf.scene;
    const box = new THREE.Box3().setFromObject(robot);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const scale = maxSize > 0 ? 2 / maxSize : 1;

    robot.scale.setScalar(scale);
    robot.position.copy(center).multiplyScalar(-scale);

    robotPivot = new THREE.Group();
    robotPivot.add(robot);
    setRobotRotation(robotRotation);
    scene.add(robotPivot);

    const mixer = gltf.animations.length > 0
      ? new THREE.AnimationMixer(robot)
      : null;

    if (mixer) {
      robotAnimation = mixer.clipAction(gltf.animations[0]);
      updateRobotAnimation();
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