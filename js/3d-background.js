(function() {
  const canvas = document.getElementById('bg3d-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let time = 0;

  const PARTICLE_COUNT = 90;
  const CONNECTION_DIST = 150;
  const ROTATION_SPEED = 0.002;
  const DEPTH = 600;

  const particles = [];
  const colors = [
    { r: 27, g: 94, b: 32 },
    { r: 46, g: 125, b: 50 },
    { r: 200, g: 230, b: 200 },
    { r: 255, g: 255, b: 255 },
  ];

  function randomColor() {
    const c = colors[Math.floor(Math.random() * colors.length)];
    return `rgba(${c.r}, ${c.g}, ${c.b}, `;
  }

  class Particle {
    constructor() {
      this.x = (Math.random() - 0.5) * 800;
      this.y = (Math.random() - 0.5) * 800;
      this.z = (Math.random() - 0.5) * DEPTH;
      this.size = Math.random() * 3 + 1.5;
      this.baseX = this.x;
      this.baseY = this.y;
      this.baseZ = this.z;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.speedZ = (Math.random() - 0.5) * 0.3;
      this.color = randomColor();
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
    }

    update(rotation, mouseInfluence) {
      this.pulse += this.pulseSpeed;

      this.baseX += this.speedX;
      this.baseY += this.speedY;
      this.baseZ += this.speedZ;

      if (Math.abs(this.baseX) > 400) this.speedX *= -1;
      if (Math.abs(this.baseY) > 400) this.speedY *= -1;
      if (Math.abs(this.baseZ) > DEPTH / 2) this.speedZ *= -1;

      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);

      const yz = this.baseY * cosR - this.baseZ * sinR;
      const zz = this.baseY * sinR + this.baseZ * cosR;

      const x = this.baseX + mouseInfluence.x;
      const y = yz + mouseInfluence.y;
      const z = zz;

      const scale = 300 / (300 + z);
      this.screenX = x * scale + width / 2;
      this.screenY = y * scale + height / 2;
      this.screenSize = this.size * scale;
      this.depth = z;
    }

    draw() {
      const pulseAlpha = 0.5 + 0.5 * Math.sin(this.pulse);
      const alpha = Math.min(1, Math.max(0.1, (1 - this.depth / DEPTH) * pulseAlpha));
      ctx.beginPath();
      ctx.fillStyle = this.color + alpha + ')';
      ctx.arc(this.screenX, this.screenY, this.screenSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
  });

  document.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  let angle = 0;

  function animate() {
    time += 0.01;
    angle += ROTATION_SPEED;

    const mouseInfluence = {
      x: mouseX * 40,
      y: mouseY * 30,
    };

    ctx.clearRect(0, 0, width, height);

    const sorted = [...particles].sort((a, b) => a.depth - b.depth);

    sorted.forEach(p => {
      p.update(angle, mouseInfluence);
      p.draw();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].screenX - particles[j].screenX;
        const dy = particles[i].screenY - particles[j].screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.25;
          const avgDepth = (particles[i].depth + particles[j].depth) / 2;
          const depthAlpha = Math.min(1, Math.max(0.05, (1 - Math.abs(avgDepth) / DEPTH)));
          ctx.beginPath();
          ctx.strokeStyle = `rgba(46, 125, 50, ${alpha * depthAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].screenX, particles[i].screenY);
          ctx.lineTo(particles[j].screenX, particles[j].screenY);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
