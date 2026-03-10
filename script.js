/**
 * script.js 
 * Handles all interactivity for the Eidi Collection Website
 */

document.addEventListener('DOMContentLoaded', () => {

    const UPI_ID = "farzain0.1n@okaxis";
    const UPI_NAME = "Farzain Rafikoddin Naikwade";

    /* ==========================================
       1. Global Theme Management
       ========================================== */
    const themeBtn = document.getElementById('themeToggleBtn');

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('eidiTheme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const renderThemeToggle = (isDark) => {
        const icon = isDark ? '☀️' : '🌙';
        return `
            <span>${icon}</span>
            <div class="theme-switch">
                <div class="theme-switch-handle"></div>
            </div>
        `;
    };

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.setAttribute('data-theme', 'dark');
    }

    // Initialize the toggle button state
    if (themeBtn) {
        const currentIsDark = document.body.getAttribute('data-theme') === 'dark';
        themeBtn.innerHTML = renderThemeToggle(currentIsDark);

        themeBtn.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('eidiTheme', 'light');
                themeBtn.innerHTML = renderThemeToggle(false);
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('eidiTheme', 'dark');
                themeBtn.innerHTML = renderThemeToggle(true);
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
    const toastNotification = document.getElementById('toastNotification');

    if (shareLinkBtn) {
        shareLinkBtn.addEventListener('click', () => {
            const urlToCopy = window.location.href;

            // Fallback for HTTP environments where Clipboard API is blocked
            const fallbackCopy = (text) => {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    const successful = document.execCommand('copy');
                    if (successful) showToast("🔗 Link copied to clipboard!");
                    else showToast("⚠️ Manual copy needed");
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            };

            // Use Clipboard API if available and secure, otherwise fallback
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(urlToCopy).then(() => {
                    showToast("🔗 Link copied to clipboard!");
                }).catch(err => {
                    fallbackCopy(urlToCopy);
                });
            } else {
                fallbackCopy(urlToCopy);
            }
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

        function startUPIPayment(amount) {
            const formattedAmount = Number(amount).toFixed(2);
            const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${formattedAmount}&cu=INR`;
            window.location.href = upiLink;
        }

        // Handle Submit logic
        sendMoneyBtn.addEventListener('click', (e) => {
            e.preventDefault();

            let amount = selectedAmount;
            if (customAmountField && customAmountField.value) {
                amount = customAmountField.value;
            }

            // Validation
            if (!amount || Number(amount) <= 0) {
                if (amountErrorMsg) amountErrorMsg.classList.remove('hidden');

                // Shake animation for error feedback
                sendMoneyBtn.style.transform = "translateX(-5px)";
                setTimeout(() => sendMoneyBtn.style.transform = "translateX(5px)", 100);
                setTimeout(() => sendMoneyBtn.style.transform = "translateX(0)", 200);
                return;
            }

            startUPIPayment(Number(amount));
        });
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

    /* ==========================================
       5. Interactive Reflections Page Logic (wishes.html)
       ========================================== */
    const lanternBtns = document.querySelectorAll('.lantern-btn');
    const wisdomModal = document.getElementById('wisdomModal');
    const wisdomText = document.getElementById('wisdomText');
    const closeWisdomModalBtn = document.getElementById('closeWisdomModalBtn');

    // Digital Tasbih Logic
    const tasbihBtn = document.getElementById('tasbihBtn');
    const tasbihCountDisplay = document.getElementById('tasbihCount');
    const resetTasbihBtn = document.getElementById('resetTasbihBtn');
    const dhikrPhraseDisplay = document.getElementById('dhikrPhrase');

    let tasbihCount = 0;

    const phrases = [
        { text: "SubhanAllah (سبحان الله)", target: 33, colorClass: "text-gold" },
        { text: "Alhamdulillah (الحمد لله)", target: 66, colorClass: "text-primary" },
        { text: "Allahu Akbar (الله أكبر)", target: 99, colorClass: "text-gold" },
        { text: "La ilaha illallah (لا إله إلا الله)", target: Infinity, colorClass: "text-text" }
    ];

    function updateTasbihDisplay() {
        if (!tasbihCountDisplay || !dhikrPhraseDisplay) return;

        tasbihCountDisplay.textContent = tasbihCount;

        // Determine the current phrase based on the count step
        let currentPhraseObj = phrases[0];
        if (tasbihCount >= phrases[2].target) {
            currentPhraseObj = phrases[3];
        } else if (tasbihCount >= phrases[1].target) {
            currentPhraseObj = phrases[2];
        } else if (tasbihCount >= phrases[0].target) {
            currentPhraseObj = phrases[1];
        }

        dhikrPhraseDisplay.textContent = currentPhraseObj.text;
    }

    if (tasbihBtn && resetTasbihBtn) {
        tasbihBtn.addEventListener('click', () => {
            tasbihCount++;
            updateTasbihDisplay();

            // Add a brief subtle press animation class if needed for mobile feedback
            tasbihBtn.classList.add('pressed');
            setTimeout(() => tasbihBtn.classList.remove('pressed'), 100);

            // Provide haptic feedback if supported by browser/device
            if (navigator.vibrate) {
                // Short vibration on every 33rd tap to let user know phrase changed
                if (tasbihCount === 33 || tasbihCount === 66 || tasbihCount === 99) {
                    navigator.vibrate([100, 50, 100]);
                } else {
                    navigator.vibrate(30);
                }
            }
        });

        resetTasbihBtn.addEventListener('click', () => {
            tasbihCount = 0;
            updateTasbihDisplay();
            if (navigator.vibrate) navigator.vibrate(50);
        });
    }

    // Islamic Wisdom Logic (Replacing generic wishes)
    const islamicWisdoms = [
        "\"And [He wants] for you to complete the period and to glorify Allah for that [to] which He has guided you; and perhaps you will be grateful.\" (Quran 2:185)",
        "The Prophet ﷺ said: \"Every nation has its festivals, and this is your festival.\" [Sahih al-Bukhari]",
        "\"Whoever fasts Ramadan, then follows it with six days (of fasting) of Shawwal, it as if he fasted all the time.\" [Sahih Muslim]",
        "\"So remember Me; I will remember you. And be grateful to Me and do not deny Me.\" (Quran 2:152)",
        "The Prophet ﷺ said: \"Exchange gifts, as that will lead to increasing your love to one another.\" [Al-Adab Al-Mufrad]",
        "\"And the Hereafter is better for you than the first [life]. And your Lord is going to give you, and you will be satisfied.\" (Quran 93:4-5)",
        "May Allah accept our fasts, prayers, and good deeds, and grant us His mercy and forgiveness."
    ];

    if (lanternBtns.length > 0 && wisdomModal && closeWisdomModalBtn) {
        lanternBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const randomIndex = Math.floor(Math.random() * islamicWisdoms.length);
                if (wisdomText) {
                    wisdomText.textContent = islamicWisdoms[randomIndex];
                }
                wisdomModal.classList.remove('hidden');
            });
        });

        closeWisdomModalBtn.addEventListener('click', () => {
            wisdomModal.classList.add('hidden');
        });

        wisdomModal.addEventListener('click', (e) => {
            if (e.target === wisdomModal) {
                wisdomModal.classList.add('hidden');
            }
        });
    }

    /* ==========================================
       6. Eid Blessings & Memory Page Logic (blessings.html)
       ========================================== */
    const introOverlay = document.getElementById('introOverlay');
    const openMessageBtn = document.getElementById('openMessageBtn');
    const revealLines = document.querySelectorAll('.reveal-line');

    // 1. Full-Screen Intro
    if (introOverlay && openMessageBtn) {
        // Prevent scrolling while intro is active
        document.body.style.overflow = 'hidden';

        openMessageBtn.addEventListener('click', () => {
            introOverlay.classList.add('fade-out');
            document.body.style.overflow = ''; // Restore scrolling

            // Trigger text reveal shortly after intro fades
            setTimeout(() => {
                revealLines.forEach((line, index) => {
                    setTimeout(() => {
                        line.classList.add('visible');
                    }, index * 800); // 800ms between each line appearing
                });
            }, 800);
        });
    }

    // 2. "Send Me a Dua" Interaction
    const sendDuaBtn = document.getElementById('sendDuaBtn');
    const duaModal = document.getElementById('duaModal');
    const closeDuaBtn = document.getElementById('closeDuaBtn');
    const duaModalTitle = document.getElementById('duaModalTitle');
    const duaModalText = document.getElementById('duaModalText');
    const duaLoader = document.getElementById('duaLoader');

    if (sendDuaBtn && duaModal) {
        sendDuaBtn.addEventListener('click', () => {
            // Reset modal state
            duaModalTitle.textContent = "Make a silent dua for me";
            duaModalText.textContent = "Please close your eyes and take a moment to pray for my well-being and success...";
            duaLoader.classList.remove('hidden');
            closeDuaBtn.classList.add('hidden');

            duaModal.classList.remove('hidden');

            // 5 second delay simulation
            setTimeout(() => {
                duaLoader.classList.add('hidden');
                duaModalTitle.textContent = "Ameen 🤲";
                duaModalText.textContent = "May Allah accept your dua and bless you tenfold in return. Thank you.";
                closeDuaBtn.classList.remove('hidden');
            }, 5000);
        });

        if (closeDuaBtn) {
            closeDuaBtn.addEventListener('click', () => duaModal.classList.add('hidden'));
        }
    }

    // 3. Eid Countdown Timer
    // Hardcoded to an upcoming Eid date (e.g., Eid ul-Fitr 2026 roughly March 20)
    // You can update this target string as needed.
    const eidTargetDate = new Date("March 20, 2026 00:00:00").getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('mins');
    const secsEl = document.getElementById('secs');

    if (daysEl && hoursEl && minsEl && secsEl) {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = eidTargetDate - now;

            if (distance < 0) {
                // Eid has arrived / passed
                daysEl.textContent = "00"; hoursEl.textContent = "00";
                minsEl.textContent = "00"; secsEl.textContent = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysEl.textContent = days < 10 ? "0" + days : days;
            hoursEl.textContent = hours < 10 ? "0" + hours : hours;
            minsEl.textContent = minutes < 10 ? "0" + minutes : minutes;
            secsEl.textContent = seconds < 10 ? "0" + seconds : seconds;
        };

        setInterval(updateCountdown, 1000);
        updateCountdown(); // Initial call
    }

    // 4. Shareable Eid Quote Generator
    const generateQuoteBtn = document.getElementById('generateQuoteBtn');
    const copyQuoteBtn = document.getElementById('copyQuoteBtn');
    const quoteDisplay = document.getElementById('quoteDisplay');

    const eidQuotes = [
        "\"May the blessings of Allah fill your life with happiness and open all the doors of success now and always.\"",
        "\"Eid is a day to cheer and to laugh with all your heart. It’s a day to be grateful to Allah for all of His heavenly blessings upon us.\"",
        "\"May Allah forgive our sins, accept our sacrifices, and relieve the suffering of all Muslims globally.\"",
        "\"Let this Eid be the occasion of sharing the love and caring for the people who need to be loved and cared for. Eid Mubarak!\"",
        "\"May the magic of this Eid bring lots of happiness in your life and may you celebrate it with all your close friends and may it fill your heart with wonders.\"",
        "\"Eid Mubarak! May Allah accept your good deeds, forgive your transgressions and ease the suffering of all peoples around the globe.\"",
        "\"May every drop of your sacrifice's blood get accepted by Allah (SWT) who is the most merciful and all-forgiving! Eid Mubarak.\"",
        "\"Feel the magic of Eid around you and know that the grace of God is always with you.\"",
        "\"May the divine blessings of Allah bring you hope, faith, and joy today and forever.\"",
        "\"May God give you happiness of heaven above. Happy Eid Mubarak To You All.\""
    ];

    if (generateQuoteBtn && quoteDisplay && copyQuoteBtn) {
        generateQuoteBtn.addEventListener('click', () => {
            // Add a quick fade out/in effect
            quoteDisplay.style.opacity = '0';
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * eidQuotes.length);
                quoteDisplay.textContent = eidQuotes[randomIndex];
                quoteDisplay.style.opacity = '1';

                // Reset copy button if it was in "Copied!" state
                copyQuoteBtn.innerHTML = "📋 Copy";
            }, 300);
        });

        copyQuoteBtn.addEventListener('click', () => {
            const textToCopy = quoteDisplay.textContent.replace(/"/g, ''); // Optional: remove quotes when copying
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyQuoteBtn.innerHTML = "✅ Copied!";
                setTimeout(() => {
                    copyQuoteBtn.innerHTML = "📋 Copy";
                }, 2000);
            }).catch(err => {
                console.error("Failed to copy", err);
            });
        });
    }

});
