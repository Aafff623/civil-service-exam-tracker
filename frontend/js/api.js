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

async function getQuestions(params = {}) {
    const query = new URLSearchParams();
    if (params.subject_id) query.append('subject_id', params.subject_id);
    if (params.type) query.append('type', params.type);
    if (params.page) query.append('page', params.page);
    if (params.per_page) query.append('per_page', params.per_page);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/questions/${queryString}`);
}

async function getQuestion(id) {
    return apiRequest(`/questions/${id}`);
}

async function submitAnswer(question_id, selected_answer) {
    return apiRequest('/answers/', {
        method: 'POST',
        body: { question_id, selected_answer }
    });
}

async function getAnswerHistory(params = {}) {
    const query = new URLSearchParams();
    if (params.subject_id) query.append('subject_id', params.subject_id);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/answers/history${queryString}`);
}
