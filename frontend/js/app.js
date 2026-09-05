const App = (() => {
  // Utility: Mask Aadhar number (display last 4 digits)
  const maskAadhar = (aadhar) => {
    if (!aadhar || aadhar.length !== 12) return aadhar;
    return `XXXX-XXXX-${aadhar.substring(8)}`;
  };

  // Utility: Get formatted HTML badge for AYUSH System
  const getSystemBadgeHTML = (system) => {
    const sys = system || 'Ayurveda';
    let badgeClass = 'badge-ayurveda';
    if (sys.includes('Yoga')) badgeClass = 'badge-yoga';
    else if (sys.includes('Unani')) badgeClass = 'badge-unani';
    else if (sys.includes('Siddha')) badgeClass = 'badge-siddha';
    else if (sys.includes('Homeopathy')) badgeClass = 'badge-homeopathy';

    return `<span class="badge-system ${badgeClass}">${sys}</span>`;
  };

  // Toast notification UI
  const showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Check Auth status for protected pages
  const checkAuth = () => {
    const token = localStorage.getItem('ayush_token');
    const doctorJson = localStorage.getItem('ayush_doctor');
    const currentPath = window.location.pathname;

    const isAuthPage = currentPath.endsWith('index.html') || currentPath.endsWith('register.html') || currentPath === '/';

    if (!token && !isAuthPage) {
      window.location.href = 'index.html';
      return null;
    }

    if (token && isAuthPage) {
      window.location.href = 'dashboard.html';
      return null;
    }

    if (doctorJson) {
      try {
        const doctor = JSON.parse(doctorJson);
        // Update header user info if present
        const userNameEl = document.getElementById('nav-user-name');
        const userSysEl = document.getElementById('nav-user-system');
        if (userNameEl) userNameEl.innerText = doctor.name;
        if (userSysEl) userSysEl.innerText = doctor.ayush_system;
        return doctor;
      } catch (e) {
        console.error('Error parsing stored doctor profile');
      }
    }
    return null;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('ayush_token');
    localStorage.removeItem('ayush_doctor');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  };

  // Format Date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format Date & Time for case visit
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    maskAadhar,
    getSystemBadgeHTML,
    showToast,
    checkAuth,
    logout,
    formatDate,
    formatDateTime
  };
})();

// Attach event listeners on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.checkAuth();

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      App.logout();
    });
  }
});
