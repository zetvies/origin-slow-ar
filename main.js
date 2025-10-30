import {mockWithVideo, mockWithImage} from './libs/camera-mock.js';
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {

    // mockWithVideo('./assets/mock-videos/course-banner1.mp4');
    // mockWithImage('./assets/targets/sticker.png');

    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: './assets/targets/sticker.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    const geometry = new THREE.PlaneGeometry(1.2,1.8);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./assets/flyer.png');
    // Use a shader to make near-black pixels transparent
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        threshold: { value: 0.1 } // adjust to tune how much black becomes transparent
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
    const bgGeometry = new THREE.PlaneGeometry(1.1, 1.8);
    // Feathered-edge background using a shader for a soft drop-shadow look
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x000000) },
        uOpacity: { value: 0.5 }, // center opacity
        uEdgeWidth: { value: 0.12 } // feather size from edge (0-0.5). Tune to taste
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uEdgeWidth;
        varying vec2 vUv;
        void main() {
          // distance to the closest edge in UV space
          float d = min(min(vUv.x, vUv.y), min(1.0 - vUv.x, 1.0 - vUv.y));
          // feather alpha from 0 at edge to uOpacity inside
          float a = smoothstep(0.0, uEdgeWidth, d) * uOpacity;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    const backgroundPlane = new THREE.Mesh(bgGeometry, bgMaterial);
    backgroundPlane.position.z = -0.001; // place slightly behind the main plane

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
