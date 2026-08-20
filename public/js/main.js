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