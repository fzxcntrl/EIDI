const config = {
  name: "Farzain Naikwade",
  upiId: "farzain0.1n@okaxis",
  currency: "INR",
  profileImage: "images/profile.jpg",
  qrImage: "images/qr.png",
  message: "It’s Eidi time 😄 Tap below and make my Eid legendary."
};

const elements = {
  amountPills: document.querySelectorAll(".pill"),
  customInput: document.getElementById("customAmount"),
  payBtn: document.getElementById("payBtn"),
  copyUpiBtn: document.getElementById("copyUpiBtn"),
  modal: document.getElementById("welcomeModal"),
  continueBtn: document.getElementById("continueBtn"),
  loader: document.getElementById("loader"),
  sendBtnTop: document.getElementById("sendEidiTopBtn"),
  qrSection: document.getElementById("qrSection")
};

let currentAmount = 101;

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  populateUserData();
  initModal();
  initAmountSelection();
  initActions();

  if (elements.loader) {
    elements.loader.classList.add("hidden");
  }
}

function populateUserData() {
  const map = {
    profileName: config.name,
    profileMessage: config.message,
    upiIdText: config.upiId
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  const img = document.getElementById("profileImage");
  const qr = document.getElementById("qrImage");

  if (img) img.src = config.profileImage;
  if (qr) qr.src = config.qrImage;
}

function initModal() {
  if (!elements.modal) return;

  const visited = localStorage.getItem("eidiVisited");
  if (!visited) {
    elements.modal.classList.add("show");
  }

  if (elements.continueBtn) {
    elements.continueBtn.addEventListener("click", () => {
      elements.modal.classList.remove("show");
      localStorage.setItem("eidiVisited", "true");
    });
  }
}

function initAmountSelection() {
  if (!elements.amountPills.length) return;

  elements.amountPills.forEach(pill => {
    pill.addEventListener("click", () => {
      elements.amountPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const value = pill.dataset.amount;

      if (value === "custom") {
        elements.customInput.classList.add("show");
        elements.customInput.focus();
        currentAmount = 0;
      } else {
        elements.customInput.classList.remove("show");
        currentAmount = Number(value);
        updatePayButton();
      }
    });
  });

  if (elements.customInput) {
    elements.customInput.addEventListener("input", e => {
      currentAmount = Number(e.target.value);
      updatePayButton();
    });
  }
}

function updatePayButton() {
  if (!elements.payBtn) return;

  if (currentAmount > 0) {
    elements.payBtn.innerHTML =
      `Pay ₹${currentAmount} via UPI <i class="bx bxs-check-shield"></i>`;
  } else {
    elements.payBtn.innerHTML =
      `Pay via UPI <i class="bx bxs-check-shield"></i>`;
  }
}

function initActions() {
  if (elements.payBtn) {
    elements.payBtn.addEventListener("click", handlePayment);
  }

  if (elements.copyUpiBtn) {
    elements.copyUpiBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(config.upiId)
        .then(() => showToast("UPI ID copied"))
        .catch(() => showToast("Copy failed"));
    });
  }

  if (elements.sendBtnTop && elements.qrSection) {
    elements.sendBtnTop.addEventListener("click", e => {
      e.preventDefault();
      elements.qrSection.scrollIntoView({ behavior: "smooth" });
    });
  }
}

function handlePayment(e) {
  e.preventDefault();

  if (!currentAmount || currentAmount <= 0 || isNaN(currentAmount)) {
    showToast("Enter a valid amount");
    return;
  }

  const upiUrl =
    `upi://pay?pa=${config.upiId}` +
    `&pn=${encodeURIComponent(config.name)}` +
    `&am=${currentAmount}` +
    `&cu=${config.currency}`;

  saveRecentPayment(currentAmount);

  window.location.href = upiUrl;

  setTimeout(() => {
    window.location.href = "eidi-wall.html";
  }, 1500);
}

function saveRecentPayment(amount) {
  const senderInput = document.getElementById("senderName");
  const name =
    senderInput && senderInput.value.trim()
      ? senderInput.value.trim()
      : "Someone";

  const payment = {
    name,
    amount: `₹${amount}`,
    msg: "Eidi Sent!"
  };

  localStorage.setItem("recentPayment", JSON.stringify(payment));
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}