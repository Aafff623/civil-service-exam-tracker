const API_BASE_URL = 'http://localhost:5001/api';

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        return { ok: false, status: 0, data: { message: error.message } };
    }
}

async function getResources(params = {}) {
    const query = new URLSearchParams();
    if (params.subject_id) query.append('subject_id', params.subject_id);
    if (params.type) query.append('type', params.type);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/resources/${queryString}`);
}

async function getResource(id) {
    return apiRequest(`/resources/${id}`);
}

async function getSubjects() {
    return apiRequest('/subjects/');
}

async function register(username, password) {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: { username, password }
    });
}

async function login(username, password) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: { username, password }
    });
}

async function logout() {
    return apiRequest('/auth/logout', { method: 'POST' });
}

async function getMe() {
    return apiRequest('/auth/me');
}

async function getHealth() {
    return apiRequest('/health');
}
