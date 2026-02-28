/**
 * script.js 
 * Handles all interactivity for the Eidi Collection Website
 */

document.addEventListener('DOMContentLoaded', () => {

    // Global Configuration
    const UPI_ID = "farzain0.1n@okaxis";
    const UPI_NAME = "Farzain Naikwade";

    /* ==========================================
       1. Global Theme Management
       ========================================== */
    const themeBtn = document.getElementById('themeToggleBtn');

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('eidiTheme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.setAttribute('data-theme', 'dark');
        if (themeBtn) themeBtn.textContent = '☀️';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('eidiTheme', 'light');
                themeBtn.textContent = '🌙';
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('eidiTheme', 'dark');
                themeBtn.textContent = '☀️';
            }
        });
    }

    /* ==========================================
       2. Scroll Reveal Animation
       ========================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 50;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    /* ==========================================
       3. Main Page Interactions (index.html)
       ========================================== */

    // 3a. Eid Mubarak Popup Modal
    const eidModal = document.getElementById('eidModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (eidModal && closeModalBtn) {
        // As requested: Show every time (no localStorage checks)
        // Add a slight delay for smooth entrance
        setTimeout(() => {
            eidModal.classList.remove('hidden');
        }, 500);

        closeModalBtn.addEventListener('click', () => {
            eidModal.classList.add('hidden');
        });
    }

    // 3b. QR Code View Interactions
    const viewQrBtn = document.getElementById('viewQrBtn');
    const qrSection = document.getElementById('qrSection');

    if (viewQrBtn && qrSection) {
        viewQrBtn.addEventListener('click', () => {
            qrSection.classList.remove('hidden');
            // Slight delay to allow display:block to apply before animating opacity
            setTimeout(() => {
                qrSection.classList.add('visible');
                qrSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        });
    }

    // 3c. Fullscreen QR Modal
    const fullscreenQrBtn = document.getElementById('fullscreenQrBtn');
    const fullscreenQrModal = document.getElementById('fullscreenQrModal');
    const closeFullscreenBtn = document.getElementById('closeFullscreenBtn');

    if (fullscreenQrBtn && fullscreenQrModal) {
        fullscreenQrBtn.addEventListener('click', () => {
            fullscreenQrModal.classList.remove('hidden');
        });

        closeFullscreenBtn.addEventListener('click', () => {
            fullscreenQrModal.classList.add('hidden');
        });

        // Close on clicking outside the image
        fullscreenQrModal.addEventListener('click', (e) => {
            if (e.target === fullscreenQrModal) {
                fullscreenQrModal.classList.add('hidden');
            }
        });
    }

    // 3d. Share Setup
    const shareLinkBtn = document.getElementById('shareLinkBtn');
    const nativeShareBtn = document.getElementById('nativeShareBtn');
    const toastNotification = document.getElementById('toastNotification');

    if (shareLinkBtn) {
        shareLinkBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast("🔗 Link copied to clipboard!");
            }).catch(err => {
                console.error("Could not copy link", err);
            });
        });
    }

    if (nativeShareBtn && navigator.share) {
        nativeShareBtn.classList.remove('hidden'); // Show button if supported
        nativeShareBtn.addEventListener('click', () => {
            navigator.share({
                title: 'Eidi Collection 🌙',
                text: 'Send me your Eidi and leave a blessing!',
                url: window.location.href
            }).catch(err => console.log('Share canceled or failed', err));
        });
    }

    function showToast(message) {
        if (!toastNotification) return;
        toastNotification.textContent = message;
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    const copyUpiBtn = document.getElementById('copyUpiBtn');
    if (copyUpiBtn) {
        copyUpiBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(UPI_ID).then(() => {
                showToast("📋 UPI ID copied to clipboard!");
            }).catch(err => {
                console.error("Could not copy UPI ID", err);
            });
        });
    }

    /* ==========================================
       4. Payment Page Logic (payment.html)
       ========================================== */
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountField = document.getElementById('customAmountField');
    const sendMoneyBtn = document.getElementById('sendMoneyBtn');
    const amountErrorMsg = document.getElementById('amountErrorMsg');
    const userNameInput = document.getElementById('userNameInput');
    const userMessageInput = document.getElementById('userMessageInput');
    const loaderAnimation = document.getElementById('loaderAnimation');

    let selectedAmount = null;

    // Get App Chooser Elements
    const upiChooserModal = document.getElementById('upiChooserModal');
    const closeChooserBtn = document.getElementById('closeChooserBtn');
    const upiAppBtns = document.querySelectorAll('.upi-app-btn');

    if (amountBtns.length > 0 && sendMoneyBtn) {

        // Handle pre-defined amount clicks
        amountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                amountBtns.forEach(b => b.classList.remove('active'));
                // Add to clicked
                btn.classList.add('active');

                selectedAmount = btn.getAttribute('data-amount');

                // Clear custom input field and errors
                if (customAmountField) customAmountField.value = '';
                if (amountErrorMsg) amountErrorMsg.classList.add('hidden');
            });
        });

        // Handle custom amount input overriding buttons
        if (customAmountField) {
            customAmountField.addEventListener('input', (e) => {
                // Clear button selections
                amountBtns.forEach(b => b.classList.remove('active'));

                const val = e.target.value;
                if (val && Number(val) > 0) {
                    selectedAmount = val;
                    amountErrorMsg.classList.add('hidden');
                } else {
                    selectedAmount = null;
                }
            });
        }

        // Close Chooser Modal
        if (closeChooserBtn) {
            closeChooserBtn.addEventListener('click', () => {
                upiChooserModal.classList.add('hidden');
            });
        }

        // Handle Submit logic
        sendMoneyBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Validation
            if (!selectedAmount || Number(selectedAmount) < 1) {
                if (amountErrorMsg) amountErrorMsg.classList.remove('hidden');

                // Shake animation for error feedback
                sendMoneyBtn.style.transform = "translateX(-5px)";
                setTimeout(() => sendMoneyBtn.style.transform = "translateX(5px)", 100);
                setTimeout(() => sendMoneyBtn.style.transform = "translateX(0)", 200);
                return;
            }

            const isAndroid = /Android/i.test(navigator.userAgent);
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (isIOS && upiChooserModal) {
                // On iOS, show the custom app chooser modal
                upiChooserModal.classList.remove('hidden');
            } else {
                // On Android or Desktop, proceed with intent or standard UPI link
                processPaymentFlow("upi");
            }
        });

        // Handle App Selection from Chooser
        if (upiAppBtns) {
            upiAppBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const selectedApp = e.target.getAttribute('data-app');
                    upiChooserModal.classList.add('hidden');
                    processPaymentFlow(selectedApp);
                });
            });
        }

        function processPaymentFlow(appPrefix) {
            // Optional Inputs cleanup
            const donorName = userNameInput ? userNameInput.value.trim() : '';
            const donorMsg = userMessageInput ? userMessageInput.value.trim() : '';

            // Note: UPI handles basic notes. We encode URI component to ensure it doesn't break link.
            let paymentNote = "Eidi";
            if (donorName) paymentNote += ` from ${donorName}`;

            // UPI Params (Keep it extremely lean for personal UPI IDs to avoid app-specific validation failures)
            const upiParams = `pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${selectedAmount}&cu=INR`;

            let upiPaymentURL;
            const isAndroid = /Android/i.test(navigator.userAgent);

            // Determine protocol based on platform and user selection
            if (isAndroid) {
                // If a specific app was chosen from the fallback chooser, use its custom URI scheme
                // Otherwise use the standard Android intent for the general "UPI" option
                if (appPrefix !== "upi" && appPrefix) {
                    upiPaymentURL = `${appPrefix}://pay?${upiParams}`;
                } else {
                    // Standard Android Intent without a forced package so the OS chooser works correctly 
                    // and passes the am parameter cleanly to the chosen app
                    upiPaymentURL = `intent://pay?${upiParams}#Intent;scheme=upi;end`;
                }
            } else {
                // For iOS / standard link using selected app prefix
                // GPay on iOS sometimes requires 'tez://upi/' instead of 'gpay://upi/'
                let finalPrefix = appPrefix;
                if (appPrefix === "gpay") finalPrefix = "tez";
                else if (appPrefix === "paytmmp") finalPrefix = "paytm"; // specifically paytm on ios

                upiPaymentURL = `${finalPrefix}://pay?${upiParams}`;
            }

            // Trigger Confetti and UI transition
            triggerConfetti();
            sendMoneyBtn.classList.add('hidden');

            if (loaderAnimation) {
                loaderAnimation.classList.remove('hidden');
            }

            // Slight delay before redirect so user sees the feedback
            setTimeout(() => {
                window.location.href = upiPaymentURL;

                // Restore button state after some time in case they return
                setTimeout(() => {
                    sendMoneyBtn.classList.remove('hidden');
                    if (loaderAnimation) loaderAnimation.classList.add('hidden');
                }, 3000);

            }, 1000);
        }
    }

    function triggerConfetti() {
        if (typeof confetti !== 'undefined') {
            const count = 200;
            const defaults = {
                origin: { y: 0.7 }
            };

            function fire(particleRatio, opts) {
                confetti(Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(count * particleRatio)
                }));
            }

            fire(0.25, { spread: 26, startVelocity: 55, colors: ['#D4AF37', '#014421'] });
            fire(0.2, { spread: 60, colors: ['#D4AF37', '#014421'] });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#D4AF37', '#014421'] });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#D4AF37', '#014421'] });
            fire(0.1, { spread: 120, startVelocity: 45, colors: ['#D4AF37', '#014421'] });
        }
    }

});
