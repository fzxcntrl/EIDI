const config = {
  // Replace these with your details
  name: "Farzain Naikwade",
  upiId: "farzain0.1n@okaxis", // example: john@okhdfcbank
  currency: "INR",
  profileImage: "profile.jpg", // Or local path like 'assets/profile.jpg'
  qrImage: "qr.png", // Or local path like 'assets/qr.png'
  message: "It’s Eidi time 😄 Tap below and make my Eid legendary.",
};

// DOM Elements
const elements = {
  amountPills: document.querySelectorAll('.pill'),
  customInput: document.getElementById('customAmount'),
  payBtn: document.getElementById('payBtn'),
  copyUpiBtn: document.getElementById('copyUpiBtn'),
  modalOverlay: document.getElementById('welcomeModal'),
  continueBtn: document.getElementById('continueBtn'),
  loader: document.getElementById('loader'),
  musicToggle: document.getElementById('musicToggle'),
  sendEidiTopBtn: document.getElementById('sendEidiTopBtn'),
  qrSection: document.getElementById('qrSection')
};

let currentAmount = '101'; // Default amount

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  // Simulate loading
  setTimeout(() => {
    if (elements.loader) {
      elements.loader.classList.add('hidden');
    }
    checkFirstVisit();
    initParticles();
    initParallax();
  }, 1000);

  setupAmountSelection();
  setupActionButtons();
  populateUserData();
});

function populateUserData() {
  const nameEl = document.getElementById('profileName');
  const msgEl = document.getElementById('profileMessage');
  const imgEl = document.getElementById('profileImage');
  const upiEl = document.getElementById('upiIdText');
  const qrEl = document.getElementById('qrImage');

  if (nameEl) nameEl.textContent = config.name;
  if (msgEl) msgEl.textContent = config.message;
  if (imgEl) imgEl.src = config.profileImage;
  if (upiEl) upiEl.textContent = config.upiId;
  if (qrEl) qrEl.src = config.qrImage;
}

// Modal Logic
function checkFirstVisit() {
  const hasVisited = localStorage.getItem('eidiVisited');
  if (!hasVisited && elements.modalOverlay) {
    elements.modalOverlay.classList.add('show');

    if (elements.continueBtn) {
      elements.continueBtn.addEventListener('click', () => {
        elements.modalOverlay.classList.remove('show');
        localStorage.setItem('eidiVisited', 'true');
        playHaptic();
      });
    }
  }
}

// Amount Selection Logic
function setupAmountSelection() {
  if (!elements.amountPills.length) return;

  elements.amountPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      // Remove active class from all
      elements.amountPills.forEach(p => p.classList.remove('active'));
      // Add active to clicked
      e.target.classList.add('active');
      playHaptic();

      const amount = e.target.getAttribute('data-amount');

      if (amount === 'custom') {
        elements.customInput.classList.add('show');
        elements.customInput.focus();
        currentAmount = '';
      } else {
        elements.customInput.classList.remove('show');
        currentAmount = amount;
        updatePayButton(amount);
      }
    });
  });

  if (elements.customInput) {
    elements.customInput.addEventListener('input', (e) => {
      currentAmount = e.target.value;
      updatePayButton(currentAmount || '0');
    });
  }
}

function updatePayButton(amount) {
  if (elements.payBtn) {
    if (amount && amount > 0) {
      elements.payBtn.innerHTML = `Pay ₹${amount} via UPI <i class="bx bxs-check-shield"></i>`;
    } else {
      elements.payBtn.innerHTML = `Pay via UPI <i class="bx bxs-check-shield"></i>`;
    }
  }
}

// Action Buttons
function setupActionButtons() {
  // Deep Link Generation
  if (elements.payBtn) {
    elements.payBtn.addEventListener('click', (e) => {
      e.preventDefault();
      elements.payBtn.classList.add('animate-shake');
      setTimeout(() => elements.payBtn.classList.remove('animate-shake'), 400);
      playHaptic();

      let amt = currentAmount;
      if (elements.customInput && elements.customInput.classList.contains('show')) {
        amt = elements.customInput.value;
      }

      if (!amt || isNaN(amt) || amt <= 0) {
        showToast('Please select or enter an amount 💚', 'bx-error-circle');
        return;
      }

      // Generate UPI URI
      // Format: upi://pay?pa=UPIID&pn=NAME&am=AMOUNT&cu=INR
      const upiUrl = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.name)}&am=${amt}&cu=${config.currency}`;

      // Try opening the deep link
      window.location.href = upiUrl;

      // Save sender to local storage to show on Wall
      const senderNameInput = document.getElementById('senderName');
      const senderName = (senderNameInput && senderNameInput.value.trim() !== '') ? senderNameInput.value.trim() : 'Someone';
      const recentPayment = { name: senderName, amount: `₹${amt}`, msg: "Eidi Sent! ✨" };
      localStorage.setItem('recentPayment', JSON.stringify(recentPayment));

      // Fallback & Redirect
      setTimeout(() => {
        showToast('Please scan QR using your UPI app.', 'bx-qr-scan');
        // Redirect to Eidi wall so they see their name
        setTimeout(() => {
          window.location.href = 'eidi-wall.html';
        }, 1500);
      }, 2000);
    });
  }

  // Copy UPI ID
  if (elements.copyUpiBtn) {
    elements.copyUpiBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(config.upiId).then(() => {
        showToast('UPI ID Copied! ✨', 'bx-check-circle');
        playHaptic();
      });
    });
  }

  // Scroll to QR
  if (elements.sendEidiTopBtn && elements.qrSection) {
    elements.sendEidiTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      elements.qrSection.scrollIntoView({ behavior: 'smooth' });
      playHaptic();
    });
  }

  // Music Toggle
  if (elements.musicToggle) {
    let isPlaying = false;
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_249ea9dfbe.mp3?filename=ramadan-background-v2-111197.mp3'); // Example soft tone, change as needed
    audio.loop = true;

    elements.musicToggle.addEventListener('click', () => {
      const icon = elements.musicToggle.querySelector('i');
      if (isPlaying) {
        audio.pause();
        icon.classList.replace('bx-volume-full', 'bx-volume-mute');
      } else {
        audio.play().catch(e => console.log("Audio play failed:", e));
        icon.classList.replace('bx-volume-mute', 'bx-volume-full');
      }
      isPlaying = !isPlaying;
      playHaptic();
    });
  }
}

// Background Particles
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const particleCount = 30;
  for (let i = 0; i < particleCount; i++) {
    createStar(container);
  }
}

function createStar(container) {
  const star = document.createElement('div');
  star.classList.add('star');

  // Random position, size, and animation duration
  const x = Math.random() * 100;
  const size = Math.random() * 4 + 1;
  const duration = Math.random() * 3 + 4;
  const delay = Math.random() * 5;

  star.style.left = `${x}vw`;
  star.style.bottom = `-10px`;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.animationDuration = `${duration}s`;
  star.style.animationDelay = `${delay}s`;

  container.appendChild(star);

  // Recreate star after it floats up
  setTimeout(() => {
    star.remove();
    createStar(container);
  }, (duration + delay) * 1000);
}

// Parallax Effect
function initParallax() {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const particles = document.getElementById('particles');
    if (particles) {
      // Slight upward movement relative to fixed background
      particles.style.transform = `translateY(${scrolled * 0.4}px)`;
    }
  }, { passive: true });
}

// Utilities
function playHaptic() {
  if (navigator.vibrate) {
    navigator.vibrate(50); // Short vibration
  }
}

function showToast(message, iconClass = 'bx-bell') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.innerHTML = `
    <i class='bx ${iconClass} toast-icon'></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
