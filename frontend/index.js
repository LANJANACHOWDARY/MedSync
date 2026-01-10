document.addEventListener('DOMContentLoaded', () => {
    // 1. Reveal Animation (Homepage & Dashboard)
    // We target cards, sections, form fields, and tables
    const revealItems = document.querySelectorAll('.card, .reveal, .top-nav, .field, table');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the 'active' class to trigger the CSS transition
                entry.target.classList.add('active');
                
                /** * TABLE FIX: 
                 * When a table is animated from opacity 0, browsers sometimes fail 
                 * to calculate column widths. This forces the table to 100% width 
                 * and 'table' display mode the moment it becomes visible.
                 */
                if (entry.target.tagName === 'TABLE') {
                    entry.target.style.display = 'table';
                    entry.target.style.width = '100%';
                }
                
                // Stop observing once the element has been revealed
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Triggers slightly before the element hits the viewport
    });

    revealItems.forEach(item => {
        // Ensure items start in the 'reveal' state (opacity 0)
        item.classList.add('reveal');
        observer.observe(item);
    });

    // 2. Auth Redirection
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Get the role from the URL (e.g., auth.html?role=hospital)
            const urlParams = new URLSearchParams(window.location.search);
            const role = urlParams.get('role');

            if (role === 'hospital') {
                window.location.href = 'hospital-dashboard.html';
            } else if (role === 'ngo') {
                window.location.href = 'ngo-dashboard.html';
            } else {
                window.location.href = 'donor-dashboard.html';
            }
        });
    }

    // 3. Status Color Coding (Optional Extra Polish)
    // This ensures that even if you add rows dynamically, the text colors match your CSS
    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        const text = cell.innerText.toLowerCase().trim();
        if (text === 'critical') cell.style.color = '#dc2626';
        if (text === 'high') cell.style.color = '#ea580c';
        if (text === 'completed') cell.style.color = '#16a34a';
    });
});
// --- CONNECTION LOGIC ---
const API = "http://localhost:5000";

// 1. Function for add-donation.html
async function handleDonation(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input, select');
    
    const data = {
        donor_id: 1,
        medicine_name: inputs[0].value,
        quantity: inputs[1].value,
        expiry_date: inputs[2].value,
        blood_group: inputs[3].value
    };

    const res = await fetch(`${API}/add-donation`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if(res.ok) { alert("Donation Added!"); window.location.href = 'my-donations.html'; }
}

// 2. Function for hospital-dashboard.html
async function handleRequest(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.hospital_id = 1;

    const res = await fetch(`${API}/request-supply`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if(res.ok) { alert("Request Posted!"); location.reload(); }
}
async function loadTableData() {
    const API = "http://localhost:5000";

    // CHECK: Are we on the My Donations page?
    const donationTable = document.getElementById('donationsBody');
    
    if (donationTable) {
        console.log("Donation table found! Fetching data...");
        try {
            const res = await fetch(`${API}/view-donations`);
            const data = await res.json();
            
            if (data.length === 0) {
                donationTable.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No donations found.</td></tr>";
                return;
            }

            donationTable.innerHTML = data.map(d => `
                <tr>
                    <td>${d.id}</td>
                    <td>${d.medicine_name}</td>
                    <td>${d.quantity}</td>
                    <td>${d.expiry_date ? d.expiry_date.split('T')[0] : 'N/A'}</td>
                    <td class="status-completed">${d.status}</td>
                    <td>${d.blood_group}</td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Connection error:", err);
        }
    }
}

// THIS IS THE KEY: Run the function immediately
loadTableData();

// Also run it when the page finishes loading just in case
document.addEventListener('DOMContentLoaded', loadTableData);
let selectedRequestId = null;
let selectedDonationId = null;

// Function to fill the NGO tables
async function loadNGODashboard() {
    if (!window.location.pathname.includes('ngo-dashboard.html')) return;

    // Load Requests
    const reqRes = await fetch("http://localhost:5000/view-requests");
    const requests = await reqRes.json();
    document.querySelector('#ngoRequestTable tbody').innerHTML = requests.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${r.item_name}</td>
            <td>${r.quantity_needed}</td>
            <td><button class="btn" style="padding:5px 10px; font-size:12px;" onclick="selectReq(${r.id})">Select</button></td>
        </tr>
    `).join('');

    // Load Donations
    const donRes = await fetch("http://localhost:5000/view-donations");
    const donations = await donRes.json();
    document.querySelector('#ngoDonationTable tbody').innerHTML = donations.map(d => `
        <tr>
            <td>${d.id}</td>
            <td>${d.medicine_name}</td>
            <td>${d.quantity}</td>
            <td><button class="btn" style="padding:5px 10px; font-size:12px;" onclick="selectDon(${d.id})">Select</button></td>
        </tr>
    `).join('');
    
    // Load History
    const histRes = await fetch("http://localhost:5000/view-allocations");
    const history = await histRes.json();
    document.querySelector('#historyTable tbody').innerHTML = history.map(h => `
        <tr><td>${h.id}</td><td>NGO_1</td><td>${h.request_id}</td><td>${h.donation_id}</td><td>${h.allocation_date}</td></tr>
    `).join('');
}

// UI Selection Logic
function selectReq(id) {
    selectedRequestId = id;
    document.getElementById('selReq').innerText = id;
    document.getElementById('matchInfo').style.display = 'block';
}

function selectDon(id) {
    selectedDonationId = id;
    document.getElementById('selDon').innerText = id;
    document.getElementById('matchInfo').style.display = 'block';
}

// The Final API Call to match them
async function confirmMatch() {
    if (!selectedRequestId || !selectedDonationId) return alert("Select both first!");

    const res = await fetch("http://localhost:5000/allocate-supply", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            ngo_id: 1,
            request_id: selectedRequestId,
            donation_id: selectedDonationId
        })
    });

    if (res.ok) {
        alert("Match Successful! Item moved to history.");
        location.reload();
    }
}

// Ensure it loads on NGO page
document.addEventListener('DOMContentLoaded', loadNGODashboard);
