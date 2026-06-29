(function() {
  const container = document.getElementById('three-bg');
  if (!container) return;

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = initThree;
  document.head.appendChild(script);

  let scene, camera, renderer;
  let objects = [];
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;

  function initThree() {
    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8;

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    createGeometry();
    animate();

    window.addEventListener('resize', onResize);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });
    container.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const r = container.getBoundingClientRect();
      mouseX = ((touch.clientX - r.left) / width - 0.5) * 2;
      mouseY = ((touch.clientY - r.top) / height - 0.5) * 2;
    }, { passive: true });
  }

  function createGeometry() {
    const goldColor = 0xc8a45c;
    const darkGold = 0xa8883c;

    // Main torus knot
    const knotGeo = new THREE.TorusKnotGeometry(1.8, 0.65, 180, 24);
    const knotMat = new THREE.MeshPhongMaterial({
      color: goldColor,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      emissive: goldColor,
      emissiveIntensity: 0.05,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.y = 0.2;
    scene.add(knot);
    objects.push(knot);

    // Inner solid knot
    const innerMat = new THREE.MeshPhongMaterial({
      color: darkGold,
      transparent: true,
      opacity: 0.04,
      emissive: goldColor,
      emissiveIntensity: 0.02,
    });
    const inner = new THREE.Mesh(knotGeo.clone(), innerMat);
    inner.position.y = 0.2;
    inner.scale.set(0.85, 0.85, 0.85);
    scene.add(inner);
    objects.push(inner);

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(2.4, 0.03, 32, 64);
    const ringMat = new THREE.MeshPhongMaterial({
      color: goldColor,
      transparent: true,
      opacity: 0.08,
      emissive: goldColor,
      emissiveIntensity: 0.03,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);
    objects.push(ring);

    // Second ring perpendicular
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.02, 32, 64),
      new THREE.MeshPhongMaterial({
        color: goldColor,
        transparent: true,
        opacity: 0.05,
        emissive: goldColor,
        emissiveIntensity: 0.02,
      })
    );
    ring2.rotation.z = Math.PI / 4;
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);
    objects.push(ring2);

    // Small orbiting particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2.8 + Math.random() * 1.5;
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      sizes[i] = 0.02 + Math.random() * 0.04;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.PointsMaterial({
      color: goldColor,
      size: 0.04,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    objects.push(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xc8a45c, 0.3);
    scene.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0xc8a45c, 0.5);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xd4b843, 0.3);
    light2.position.set(-5, -3, -5);
    scene.add(light2);
  }

  function animate() {
    requestAnimationFrame(animate);

    targetRotX += (mouseY * 0.3 - targetRotX) * 0.05;
    targetRotY += (mouseX * 0.3 - targetRotY) * 0.05;

    objects.forEach((obj, index) => {
      const speed = 0.002 + index * 0.0003;
      obj.rotation.x += speed + targetRotX * 0.0005;
      obj.rotation.y += speed * 1.5 + targetRotY * 0.0005;
    });

    renderer.render(scene, camera);
  }

  function onResize() {
    const rect = container.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }
})();
