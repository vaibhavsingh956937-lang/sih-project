const API = (() => {
  // Determine Base URL dynamically
  const BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://localhost:3000/api'
    : '/api';

  const getHeaders = (requiresAuth = true) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (requiresAuth) {
      const token = localStorage.getItem('ayush_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const handleResponse = async (response) => {
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Unexpected server response' };
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Clear expired auth state & redirect if unauthorized
        localStorage.removeItem('ayush_token');
        localStorage.removeItem('ayush_doctor');
        if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('register.html') && window.location.pathname !== '/') {
          window.location.href = 'index.html?session=expired';
        }
      }
      throw new Error(data.error || 'API Request failed');
    }
    return data;
  };

  return {
    auth: {
      login: async (credentials) => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: getHeaders(false),
          body: JSON.stringify(credentials)
        });
        return handleResponse(res);
      },
      register: async (doctorData) => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: getHeaders(false),
          body: JSON.stringify(doctorData)
        });
        return handleResponse(res);
      }
    },
    doctors: {
      getProfile: async () => {
        const res = await fetch(`${BASE_URL}/doctors/profile`, {
          headers: getHeaders(true)
        });
        return handleResponse(res);
      }
    },
    patients: {
      search: async (query = '') => {
        const res = await fetch(`${BASE_URL}/patients?search=${encodeURIComponent(query)}`, {
          headers: getHeaders(true)
        });
        return handleResponse(res);
      },
      register: async (patientData) => {
        const res = await fetch(`${BASE_URL}/patients`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(patientData)
        });
        return handleResponse(res);
      },
      getDetails: async (aadhar) => {
        const res = await fetch(`${BASE_URL}/patients/${encodeURIComponent(aadhar)}`, {
          headers: getHeaders(true)
        });
        return handleResponse(res);
      },
      getCases: async (aadhar, limit = 50) => {
        const res = await fetch(`${BASE_URL}/patients/${encodeURIComponent(aadhar)}/cases?limit=${limit}`, {
          headers: getHeaders(true)
        });
        return handleResponse(res);
      }
    },
    cases: {
      create: async (caseData) => {
        const res = await fetch(`${BASE_URL}/cases`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(caseData)
        });
        return handleResponse(res);
      },
      getById: async (id) => {
        const res = await fetch(`${BASE_URL}/cases/${id}`, {
          headers: getHeaders(true)
        });
        return handleResponse(res);
      }
    },
    analytics: {
      getDashboard: async () => {
        const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
          headers: getHeaders(true)
        });
        return handleResponse(res);
      }
    }
  };
})();
