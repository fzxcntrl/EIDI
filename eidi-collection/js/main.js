/**
 * Eidi Collection App - Main Logic
 * Handles popup, themes, music toggle, countdown timer, share logic.
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Popup Logic (Show Once)
    const popup = document.getElementById('eid-popup');
    const closePopupBtn = document.getElementById('close-popup');

    if (popup && closePopupBtn) {
        if (!localStorage.getItem('eidPopupShown')) {
            // Show popup
            popup.classList.remove('hidden');
            
            // Trigger Confetti
            triggerConfetti();

            closePopupBtn.addEventListener('click', () => {
                popup.classList.add('hidden');
                localStorage.setItem('eidPopupShown', 'true');
            });
        }
    }

    // 2. Dark Mode Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        // Load saved preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.innerText = '☀️';
        }

        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
                themeToggleBtn.innerText = '☀️';
            } else {
                localStorage.setItem('darkMode', 'disabled');
                themeToggleBtn.innerText = '🌙';
            }
        });
    }

    // 3. Music Toggle
    const musicToggleBtn = document.getElementById('music-toggle');
    const bgAudio = document.getElementById('bg-nasheed');

    if (musicToggleBtn && bgAudio) {
        musicToggleBtn.addEventListener('click', () => {
            if (bgAudio.paused) {
                bgAudio.play().catch(e => console.log('Audio play error', e));
                musicToggleBtn.innerText = '🔇';
            } else {
                bgAudio.pause();
                musicToggleBtn.innerText = '🎵';
            }
        });
    }

    // 4. Countdown Timer Logic (Assume Eid is approx March 1, 2026 for demo or similar arbitrary date)
    // To make this dynamic, we just set a date a few days from now
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        const nextEidDate = new Date();
        nextEidDate.setDate(nextEidDate.getDate() + 5); // Example: 5 days away

        function updateCountdown() {
            const now = new Date();
            const diff = nextEidDate - now;

            if (diff <= 0) {
                timerDisplay.innerText = "It's Eid today!";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            timerDisplay.innerText = `${days}d ${hours}h`;
        }
        
        setInterval(updateCountdown, 1000 * 60); // update every minute
        updateCountdown();
    }

    // 5. Share Button Logic
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareUrl = window.location.href;
            const shareText = "Send Eidi & Spread Love this Eid! 🌙✨";

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Eidi Collection',
                        text: shareText,
                        url: shareUrl
                    });
                } catch (err) {
                    console.log('Share blocked or failed', err);
                }
            } else {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
                    showToast('Link copied to clipboard!');
                });
            }
        });
    }

    // 6. Floating Particles System (Stars)
    createParticles();
});

// --- Utility Functions ---

function triggerConfetti() {
    if (typeof confetti === 'function') {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.innerText = message;
    toast.classList.add('show');
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300); // Wait for transition
    }, 3000);
}

function createParticles() {
    const container = document.querySelector('.floating-elements');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        // Random positioning
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        // Random animation delay
        star.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(star);
    }
}

// Ensure the toast globally accessible for other scripts
window.showToast = showToast;
