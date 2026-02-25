/**
 * Eidi Collection App - Wall Logic
 * Handles retrieving messages from localStorage and rendering them to DOM.
 */

document.addEventListener('DOMContentLoaded', () => {

    const wallContainer = document.getElementById('wall-container');
    const emptyState = document.getElementById('empty-wall');

    function loadWallEntries() {
        let wallData = [];
        const existingData = localStorage.getItem('eidiWallData');

        if (existingData) {
            try {
                wallData = JSON.parse(existingData);
            } catch (e) {
                console.error("Error reading wall data.");
            }
        }

        // Render to Screen
        if (wallData.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            wallContainer.innerHTML = ''; // Clear container

            wallData.forEach((entry, index) => {
                const card = createMessageCard(entry, index);
                wallContainer.appendChild(card);
            });
        }
    }

    function createMessageCard(entry, index) {
        const div = document.createElement('div');
        div.className = 'message-card-item glass';
        // Give staggered animation delay
        div.style.animationDelay = `${index * 0.1}s`;

        // Format Date roughly
        const d = new Date(entry.timestamp);
        const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

        // Sanitize output extremely basically
        const safeName = entry.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeMsg = entry.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        let amountHtml = '';
        if (entry.amount && entry.amount > 0) {
            amountHtml = `<span class="amount-tag">₹${entry.amount}</span>`;
        }

        div.innerHTML = `
            <div class="donor-name">
                <span>${safeName}</span>
                ${amountHtml}
            </div>
            <p>${safeMsg}</p>
            <div class="text-sm mt-2" style="color:var(--gold); opacity:0.7">${dateStr}</div>
        `;

        return div;
    }

    // Initialize
    loadWallEntries();
});
