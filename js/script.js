document.addEventListener('DOMContentLoaded', () => {

  // === Mobile Hamburger ===
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = hamburger.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = hamburger.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      });
    });
  }

  // === Active Nav Highlight ===
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    }
  });

  // === Navbar Shrink on Scroll ===
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // === 3D Tilt Effect on Cards ===
  const tiltCards = document.querySelectorAll('.product-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    });
  });

  // === Scroll Reveal with Intersection Observer ===
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // === Counter Animation ===
  const counterNumbers = document.querySelectorAll('.counter-item .number');

  if (counterNumbers.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const numberEl = entry.target;
          const target = parseInt(numberEl.getAttribute('data-target'), 10);
          const duration = 2000;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            numberEl.textContent = current.toLocaleString();

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              numberEl.textContent = target.toLocaleString() + '+';
            }
          }

          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(numberEl);
        }
      });
    }, { threshold: 0.5 });

    counterNumbers.forEach(el => counterObserver.observe(el));
  }

  // === Gallery Lightbox ===
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let galleryImages = [];
  let currentIndex = 0;

  if (lightbox) {
    const items = document.querySelectorAll('.gallery-grid .gallery-item img');
    galleryImages = Array.from(items);

    items.forEach((img, index) => {
      img.addEventListener('click', () => {
        currentIndex = index;
        openLightbox(img.src);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(1);
      });
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateLightbox(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = galleryImages.length - 1;
    if (currentIndex >= galleryImages.length) currentIndex = 0;
    if (galleryImages[currentIndex]) {
      lightboxImg.src = galleryImages[currentIndex].src;
    }
  }

  // === Contact Form Validation ===
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name');
      const email = document.getElementById('form-email');
      const message = document.getElementById('form-message');
      const successMsg = document.getElementById('form-success');

      let isValid = true;

      if (name) {
        const nameError = document.getElementById('name-error');
        if (name.value.trim().length < 2) {
          showError(nameError, 'Name must be at least 2 characters');
          isValid = false;
        } else {
          hideError(nameError);
        }
      }

      if (email) {
        const emailError = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
          showError(emailError, 'Please enter a valid email address');
          isValid = false;
        } else {
          hideError(emailError);
        }
      }

      if (message) {
        const messageError = document.getElementById('message-error');
        if (message.value.trim().length < 10) {
          showError(messageError, 'Message must be at least 10 characters');
          isValid = false;
        } else {
          hideError(messageError);
        }
      }

      if (isValid && successMsg) {
        successMsg.classList.add('show');
        contactForm.reset();
        setTimeout(() => {
          successMsg.classList.remove('show');
        }, 5000);
      }
    });
  }

  function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
  }

  function hideError(element) {
    if (!element) return;
    element.classList.remove('show');
  }
});
