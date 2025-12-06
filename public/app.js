// ========== Theme Management ==========
function setTheme(theme) {
  document.body.className = '';
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else if (theme === 'grey') {
    document.body.classList.add('grey-theme');
  }
  localStorage.setItem('theme', theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

// Load theme on page load
loadTheme();

// ========== Navigation ==========
function toggleMenu() {
  const navMenu = document.getElementById('navMenu');
  navMenu.classList.toggle('active');
}

// ========== Authentication ==========
async function checkSession() {
  try {
    const response = await fetch('/api/session');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Session check failed:', error);
    return { authenticated: false };
  }
}

async function checkAuth() {
  const session = await checkSession();
  if (!session.authenticated) {
    window.location.href = '/';
  }
  return session;
}

async function logout() {
  try {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
    window.location.href = '/';
  }
}

// ========== Error Logging ==========
async function logError(errorMessage, errorStack, page) {
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorMessage, errorStack, page })
    });
  } catch (err) {
    console.error('Failed to log error:', err);
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  logError(event.message, event.error?.stack, window.location.pathname);
});

// ========== Utility Functions ==========
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ========== Form Validation ==========
function validateForm(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  
  for (let input of inputs) {
    if (!input.value || input.value.trim() === '') {
      return false;
    }
  }
  return true;
}

// ========== Local Storage Helpers ==========
function saveToLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

function loadFromLocal(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

// ========== Responsive Navigation ==========
window.addEventListener('resize', () => {
  const navMenu = document.getElementById('navMenu');
  if (window.innerWidth > 768 && navMenu) {
    navMenu.classList.remove('active');
  }
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
  const navMenu = document.getElementById('navMenu');
  const navToggle = document.querySelector('.nav-toggle');
  
  if (navMenu && navToggle && 
      !navMenu.contains(event.target) && 
      !navToggle.contains(event.target) &&
      navMenu.classList.contains('active')) {
    navMenu.classList.remove('active');
  }
});
