const defaultConfig = {
    platform_title: "MedSync",
    tagline: "Connecting Medical Supplies Where They're Needed Most",
    hero_title: "Connecting Medical Supplies\nWhere They're Needed Most",
    donor_card_title: "Donor",
    ngo_card_title: "NGO / Coordinator",
    facility_card_title: "Healthcare Facility"
};

async function onConfigChange(config) {
    // Update landing page text content
    const landingTitle = document.getElementById('landing-title');
    if (landingTitle) {
        landingTitle.textContent = config.platform_title || defaultConfig.platform_title;
    }
    
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
        const title = config.hero_title || defaultConfig.hero_title;
        heroTitle.innerHTML = title.replace(/\n/g, '<br/>');
    }
    
    const heroTagline = document.getElementById('hero-tagline');
    if (heroTagline) {
        heroTagline.textContent = config.tagline || defaultConfig.tagline;
    }
    
    const donorCardTitle = document.getElementById('donor-card-title');
    if (donorCardTitle) {
        donorCardTitle.textContent = config.donor_card_title || defaultConfig.donor_card_title;
    }
    
    const ngoCardTitle = document.getElementById('ngo-card-title');
    if (ngoCardTitle) {
        ngoCardTitle.textContent = config.ngo_card_title || defaultConfig.ngo_card_title;
    }
    
    const facilityCardTitle = document.getElementById('facility-card-title');
    if (facilityCardTitle) {
        facilityCardTitle.textContent = config.facility_card_title || defaultConfig.facility_card_title;
    }
}

function mapToCapabilities(config) {
    return {
        recolorables: [],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
    };
}

function mapToEditPanelValues(config) {
    return new Map([
        ["platform_title", config.platform_title || defaultConfig.platform_title],
        ["tagline", config.tagline || defaultConfig.tagline],
        ["hero_title", config.hero_title || defaultConfig.hero_title],
        ["donor_card_title", config.donor_card_title || defaultConfig.donor_card_title],
        ["ngo_card_title", config.ngo_card_title || defaultConfig.ngo_card_title],
        ["facility_card_title", config.facility_card_title || defaultConfig.facility_card_title]
    ]);
}

// Initialize Element SDK
if (window.elementSdk) {
    window.elementSdk.init({
        defaultConfig: defaultConfig,
        onConfigChange: onConfigChange,
        mapToCapabilities: mapToCapabilities,
        mapToEditPanelValues: mapToEditPanelValues
    });
}

// =====================================================
//  GLOBAL STATE MANAGEMENT
// =====================================================
let currentUser = null;
let currentRole = null;
let lastPage = null;

// =====================================================
//  PAGE NAVIGATION
// =====================================================
function showPage(pageId) {
    // Store current page before switching
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
        lastPage = currentPage.id;
    }
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show requested page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function goBack() {
    // Determine where to go back based on current role
    if (currentRole === 'donor') {
        showPage('donor-dashboard');
    } else if (currentRole === 'ngo') {
        showPage('ngo-dashboard');
    } else if (currentRole === 'facility') {
        showPage('facility-dashboard');
    } else if (lastPage) {
        showPage(lastPage);
    } else {
        showPage('landing-page');
    }
}

// =====================================================
//  ROLE SELECTION
// =====================================================
function selectRole(role) {
    currentRole = role;
    showPage('register-page');
    
    // Pre-select role in register form
    const roleSelect = document.getElementById('register-role');
    if (roleSelect) {
        roleSelect.value = role;
    }
}

// =====================================================
//  DASHBOARD SECTION NAVIGATION
// =====================================================
function showDashboardSection(dashboard, section) {
    // Remove active class from all sidebar items
    const sidebarItems = document.querySelectorAll(`#${dashboard}-dashboard .sidebar-item`);
    sidebarItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to clicked item
    event.target.closest('.sidebar-item')?.classList.add('active');
    
    // Hide all sections
    const sections = document.querySelectorAll(`#${dashboard}-dashboard .dashboard-section`);
    sections.forEach(sec => sec.classList.add('hidden'));
    
    // Show requested section
    const targetSection = document.getElementById(`${dashboard}-${section}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

// =====================================================
//  NOTIFICATION SYSTEM
// =====================================================
function showNotification(type, title, message) {
    const notification = document.getElementById('notification');
    const notificationIcon = document.getElementById('notification-icon');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    
    // Set icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notificationIcon.textContent = icons[type] || icons.info;
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // Remove all type classes
    notification.className = 'notification';
    notification.classList.add(type);
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        hideNotification();
    }, 4000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
}

// =====================================================
//  AUTHENTICATION HANDLERS
// =====================================================
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simulate login
    if (email && password) {
        currentUser = { email: email, name: "John Doe" };
        
        // For demo, redirect to donor dashboard
        currentRole = 'donor';
        showPage('donor-dashboard');
        showNotification('success', 'Login Successful', 'Welcome back to MedSync!');
    } else {
        showNotification('error', 'Login Failed', 'Please enter valid credentials');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    
    if (name && email && phone && password && role) {
        currentUser = { email: email, name: name };
        currentRole = role;
        
        // Redirect to appropriate dashboard
        if (role === 'donor') {
            showPage('donor-dashboard');
        } else if (role === 'ngo') {
            showPage('ngo-dashboard');
        } else if (role === 'facility') {
            showPage('facility-dashboard');
        }
        
        showNotification('success', 'Account Created', `Welcome to MedSync, ${name}!`);
    } else {
        showNotification('error', 'Registration Failed', 'Please fill in all required fields');
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    showPage('landing-page');
    showNotification('info', 'Logged Out', 'You have been successfully logged out');
}

// =====================================================
//  DONOR - ADD DONATION
// =====================================================
function handleAddDonation(event) {
    event.preventDefault();
    
    const name = document.getElementById('donation-name').value;
    const category = document.getElementById('donation-category').value;
    const quantity = document.getElementById('donation-quantity').value;
    const unit = document.getElementById('donation-unit').value;
    const location = document.getElementById('donation-location').value;
    const expiry = document.getElementById('donation-expiry').value;
    const condition = document.getElementById('donation-condition').value;
    const notes = document.getElementById('donation-notes').value;
    
    if (name && category && quantity && location && condition) {
        // Show success message
        showNotification('success', 'Donation Submitted', 'Your donation has been successfully recorded');
        
        // Reset form
        event.target.reset();
        
        // Navigate back to overview
        showDashboardSection('donor', 'overview');
    } else {
        showNotification('error', 'Submission Failed', 'Please fill in all required fields');
    }
}

// =====================================================
//  FACILITY - REQUEST SUPPLIES
// =====================================================
function handleSupplyRequest(event) {
    event.preventDefault();
    
    const name = document.getElementById('request-name').value;
    const category = document.getElementById('request-category').value;
    const quantity = document.getElementById('request-quantity').value;
    const priority = document.getElementById('request-priority').value;
    const department = document.getElementById('request-department').value;
    const reason = document.getElementById('request-reason').value;
    const contact = document.getElementById('request-contact').value;
    
    if (name && category && quantity && priority && department && reason && contact) {
        // Show success message
        showNotification('success', 'Request Submitted', 'Your supply request has been submitted for review');
        
        // Reset form
        event.target.reset();
        
        // Navigate back to overview
        showDashboardSection('facility', 'overview');
    } else {
        showNotification('error', 'Submission Failed', 'Please fill in all required fields');
    }
}

// =====================================================
//  NGO - ALLOCATE SUPPLIES
// =====================================================
function openAllocateModal() {
    const modal = document.getElementById('allocate-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function closeModalOnOverlay(event) {
    if (event.target === event.currentTarget) {
        closeModal(event.currentTarget.id);
    }
}

function handleAllocate(event) {
    event.preventDefault();
    
    const facility = document.getElementById('allocate-facility').value;
    const quantity = document.getElementById('allocate-quantity').value;
    const notes = document.getElementById('allocate-notes').value;
    
    if (facility && quantity) {
        showNotification('success', 'Allocation Successful', 'Supply has been allocated to the facility');
        closeModal('allocate-modal');
        event.target.reset();
    } else {
        showNotification('error', 'Allocation Failed', 'Please fill in all required fields');
    }
}

// =====================================================
//  INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('MedSync Platform Initialized');
    
    // Show landing page by default
    showPage('landing-page');
});