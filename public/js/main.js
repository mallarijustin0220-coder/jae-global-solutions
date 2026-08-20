document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                
                if (result.success) {
                    alert('Thank you! Your enquiry has been submitted successfully.');
                    contactForm.reset();
                }
            } catch (err) {
                alert('There was an issue submitting your request. Please try again.');
            }
        });
    }
});

// public/scripts/main.js

document.addEventListener('click', function (e) {
  const toggleBtn = e.target.closest('#nav-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  const targetToggle = document.getElementById('nav-toggle-btn');

  // Toggle button clicked
  if (toggleBtn && navMenu) {
    toggleBtn.classList.toggle('is-active');
    navMenu.classList.toggle('is-active');
    return;
  }

  // Close menu when clicking a navigation link
  if (e.target.closest('.nav-link') && navMenu && targetToggle) {
    navMenu.classList.remove('is-active');
    targetToggle.classList.remove('is-active');
    return;
  }

  // Close menu when clicking outside
  if (navMenu && navMenu.classList.contains('is-active')) {
    if (!e.target.closest('.site-header')) {
      navMenu.classList.remove('is-active');
      if (targetToggle) targetToggle.classList.remove('is-active');
    }
  }
});

// Cap pixel ratio to 1.5 max (avoids 4K rendering lag on phones/laptops)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

// Pause 3D animation loop when user scrolls away from the section
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animate(); // Start animation loop when visible
    } else {
      cancelAnimationFrame(animationFrameId); // Pause loop off-screen
    }
  });
});

const targetSection = document.querySelector('.reviews-hero-3d');
if (targetSection) {
  // your targetSection code here
}

document.addEventListener('DOMContentLoaded', () => {
  // Forcefully remove any scroll-locking styles injected by JS libraries
  document.documentElement.style.overflow = 'auto';
  document.body.style.overflow = 'auto';
  document.body.style.position = 'static';

  // Disable wheel event hijackers
  window.addEventListener('wheel', (e) => {
    e.stopPropagation();
  }, { capture: true, passive: true });
});