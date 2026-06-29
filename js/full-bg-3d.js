(function() {
  const container = document.getElementById('full-bg-3d');
  if (!container) return;

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  let ready = false;
  script.onload = () => { ready = true; initScene(); };
  document.head.appendChild(script);

  let scene, camera, renderer;
  let particles, particleData = [];
  let time = 0;
  let mouseX = 0, mouseY = 0;

  const COUNT = 400;
  const SPREAD = 20;
  const HEIGHT = 6;

  function initScene() {
    if (!ready) return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 4, 14);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const gold = new THREE.Color(0xc8a45c);
    const gold2 = new THREE.Color(0xd4b843);
    const white = new THREE.Color(0xf5f0e8);

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * SPREAD;
      const z = (Math.random() - 0.5) * SPREAD;
      const y = (Math.random() - 0.5) * HEIGHT;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      const c = i % 2 === 0 ? gold : i % 3 === 0 ? gold2 : white;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      sizes[i] = 0.08 + Math.random() * 0.15;

      particleData.push({
        baseX: x, baseY: y, baseZ: z,
        speed: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        amp: 0.3 + Math.random() * 0.8,
        size: sizes[i],
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Connection lines between nearby particles
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xc8a45c,
      transparent: true,
      opacity: 0.04,
    });

    const connectionGroups = [];
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = particleData[i].baseX - particleData[j].baseX;
        const dz = particleData[i].baseZ - particleData[j].baseZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 3.5 && Math.random() < 0.15) {
          connectionGroups.push(i, j);
        }
      }
    }

    if (connectionGroups.length > 0) {
      const lineGeo = new THREE.BufferGeometry();
      const linePos = new Float32Array(connectionGroups.length * 3);
      for (let k = 0; k < connectionGroups.length; k++) {
        const idx = connectionGroups[k];
        const p = particleData[idx];
        linePos[k * 3] = p.baseX;
        linePos[k * 3 + 1] = p.baseY;
        linePos[k * 3 + 2] = p.baseZ;
      }
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lines);
    }

    animate();

    window.addEventListener('resize', onResize);
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    document.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });
  }

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    if (!particles) return;

    const pos = particles.geometry.attributes.position.array;

    for (let i = 0; i < COUNT; i++) {
      const d = particleData[i];
      const i3 = i * 3;
      const wave1 = Math.sin(time * d.speed + d.phase + d.baseX * 0.4) * d.amp;
      const wave2 = Math.cos(time * d.speed * 0.7 + d.phase * 1.3 + d.baseZ * 0.3) * d.amp * 0.6;
      const wave3 = Math.sin(time * d.speed * 0.5 + d.phase * 0.7 + d.baseX * 0.2 + d.baseZ * 0.2) * d.amp * 0.4;
      pos[i3] = d.baseX + Math.sin(time * 0.3 + d.phase) * 0.2;
      pos[i3 + 1] = d.baseY + wave1 + wave2 + wave3;
      pos[i3 + 2] = d.baseZ + Math.cos(time * 0.2 + d.phase * 0.5) * 0.2;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    const tiltX = mouseY * 0.05;
    const tiltY = mouseX * 0.05;
    particles.rotation.x += (tiltX - particles.rotation.x) * 0.02;
    particles.rotation.y += (tiltY - particles.rotation.y) * 0.02;
    particles.rotation.z = Math.sin(time * 0.05) * 0.01;

    renderer.render(scene, camera);
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
})();
