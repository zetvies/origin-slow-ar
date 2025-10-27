import {mockWithVideo, mockWithImage} from './libs/camera-mock.js';
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {

    // mockWithVideo('./assets/mock-videos/course-banner1.mp4');
    // mockWithImage('./assets/mock-videos/course-banner1.png');

    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './assets/targets/qr.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    const geometry = new THREE.PlaneGeometry(2, 3);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./assets/flyer.png');
    const material = new THREE.MeshBasicMaterial({map: texture});
    const plane = new THREE.Mesh(geometry, material);

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(plane);

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
