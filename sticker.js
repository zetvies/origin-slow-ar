import {mockWithVideo, mockWithImage} from './libs/camera-mock.js';
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {

    // mockWithVideo('./assets/mock-videos/course-banner1.mp4');
    // mockWithImage('./assets/mock-videos/course-banner1.png');

    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './assets/targets/sticker-texture.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    const geometry = new THREE.PlaneGeometry(1, 1.5);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./assets/flyer.png');
    // Use a shader to make near-black pixels transparent
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        threshold: { value: 0.1 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float threshold;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(map, vUv);
          float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
          if (luminance < threshold) discard;
          gl_FragColor = color;
        }
      `,
      transparent: true
    });
    const plane = new THREE.Mesh(geometry, material);

    // Semi-transparent black background plane as a separate object
    const bgGeometry = new THREE.PlaneGeometry(0.9, 1.5);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const backgroundPlane = new THREE.Mesh(bgGeometry, bgMaterial);
    backgroundPlane.position.z = -0.001;

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(backgroundPlane);
    anchor.group.add(plane);

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
