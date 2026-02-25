/**
 * Eidi Collection App - Payment & Form Logic
 * Handles Amount Selection, UPI redirection, Desktop QR fallback,
 * and saving messages to localStorage.
 */

// User Configuration (Ideally this would come from a backend)
const UPI_ID = "farzain@upi"; // replace with actual UPI ID
const UPI_NAME = "Farzain Naikwade"; // replace with actual name

document.addEventListener('DOMContentLoaded', () => {

    let selectedAmount = 0;

    // --- Interactive Elements ---
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount');
    const payNowBtn = document.getElementById('pay-now-btn');
    const instructionArea = document.getElementById('payment-instruction-area');
    const desktopQrView = document.getElementById('desktop-qr-view');
    const mobileUpiView = document.getElementById('mobile-upi-view');
    const deepLinkFallback = document.getElementById('deep-link-fallback');

    // Set UI for UPI display string
    const displayUpiId = document.getElementById('display-upi-id');
    if (displayUpiId) displayUpiId.innerText = UPI_ID;

    // 1. Amount selection logic
    amountButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            amountButtons.forEach(b => b.classList.remove('active'));
            // Add to clicked
            e.target.classList.add('active');

            // Set value and clear custom input
            selectedAmount = parseInt(e.target.getAttribute('data-amount'), 10);
            customAmountInput.value = '';
        });
    });

    customAmountInput.addEventListener('input', (e) => {
        // Clear active states on buttons if user types custom amount
        amountButtons.forEach(b => b.classList.remove('active'));
        if (e.target.value) {
            selectedAmount = parseInt(e.target.value, 10);
        } else {
            selectedAmount = 0;
        }
    });

    // 2. Pay Button Logic
    payNowBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (!selectedAmount || selectedAmount < 1) {
            window.showToast("Please select or enter a valid amount greater than ₹1");
            return;
        }

        initiatePayment(selectedAmount);
    });

    // 3. Form Submission Logic
    const eidiForm = document.getElementById('eidi-form');
    eidiForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('donor-name').value.trim();
        const messageInput = document.getElementById('donor-message').value.trim();

        if (!nameInput) {
            window.showToast("Name is required!");
            return;
        }

        saveToWall(nameInput, messageInput, selectedAmount);

        // Form reset and user feedback
        eidiForm.reset();
        window.showToast("Eidi Sent Successfully! Pinning to wall...");

        // Trigger fireworks if the user pays before form fill!
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 180, origin: { y: 0.6 } });
        }

        setTimeout(() => {
            window.location.href = 'wall.html';
        }, 1500);
    });

    // 4. Copy UPI ID logic
    const copyUpiBtn = document.getElementById('copy-upi');
    if (copyUpiBtn) {
        copyUpiBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(UPI_ID).then(() => {
                window.showToast("UPI ID Copied!");
            });
        });
    }

    // --- Helper Functions ---

    function initiatePayment(amount) {
        // Construct the UPI URI
        // Format: upi://pay?pa=UPI_ID&pn=UPI_NAME&am=AMOUNT&cu=INR
        const upiUri = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR`;

        // Show instruction area
        instructionArea.classList.remove('hidden');

        // Check if device is mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Mobile: Attempt deep link redirect
            desktopQrView.classList.add('hidden');
            mobileUpiView.classList.remove('hidden');

            // Set fallback link
            deepLinkFallback.href = upiUri;

            // Try redirect
            window.location.href = upiUri;
        } else {
            // Desktop: Show QR Code
            mobileUpiView.classList.add('hidden');
            desktopQrView.classList.remove('hidden');

            // Generate QR Code internally using QRCode.js
            generateQR(upiUri);
        }
    }

    function generateQR(text) {
        const qrContainer = document.getElementById('qr-image');
        // Using an external API as a fallback if qrcode.js fails or is lightweight.
        // Google Charts APIs works simply for QR generation.
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
        qrContainer.src = apiUrl;
    }

    function saveToWall(name, message, amount) {
        const newEntry = {
            id: Date.now(),
            name: name,
            message: message || "Eid Mubarak! ✨",
            amount: amount,
            timestamp: new Date().toISOString()
        };

        // Load existing wall data
        let wallData = [];
        const existingData = localStorage.getItem('eidiWallData');
        if (existingData) {
            try {
                wallData = JSON.parse(existingData);
            } catch (e) { console.error("Could not parse wall data"); }
        }

        wallData.unshift(newEntry); // Add to beginning (newest first)
        localStorage.setItem('eidiWallData', JSON.stringify(wallData));
    }
});
