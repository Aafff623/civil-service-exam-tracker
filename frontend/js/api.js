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
    if (params.has_questions) query.append('has_questions', params.has_questions);
    if (params.practice_only) query.append('practice_only', params.practice_only);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/resources/${queryString}`);
}

async function getResource(id) {
    return apiRequest(`/resources/${id}`);
}

async function getSubjects() {
    return apiRequest('/subjects/');
}

async function createResource(payload) {
    return apiRequest('/resources/', { method: 'POST', body: payload });
}

async function deleteResource(id) {
    return apiRequest(`/resources/${id}`, { method: 'DELETE' });
}

async function batchDeleteResources(ids) {
    return apiRequest('/resources/batch-delete', { method: 'POST', body: { ids } });
}

async function createSubject(name) {
    return apiRequest('/subjects/', { method: 'POST', body: { name } });
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
    if (params.resource_id) query.append('resource_id', params.resource_id);
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

async function getPlanGoal() {
    return apiRequest('/plans/goal');
}

async function savePlanGoal(goal) {
    return apiRequest('/plans/goal', { method: 'POST', body: goal });
}

async function getPlan() {
    return apiRequest('/plans/');
}

async function generatePlan(goal) {
    return apiRequest('/plans/generate', { method: 'POST', body: goal || {} });
}

async function getPlanItems(params = {}) {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/plans/items${queryString}`);
}

async function updatePlanItem(id, is_completed) {
    return apiRequest(`/plans/items/${id}`, {
        method: 'PATCH',
        body: { is_completed }
    });
}

async function getPlanSubjects() {
    return apiRequest('/plans/subjects');
}

async function getProgress(params = {}) {
    const query = new URLSearchParams();
    if (params.days) query.append('days', params.days);
    if (params.year) query.append('year', params.year);
    if (params.month) query.append('month', params.month);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/progress/${queryString}`);
}

async function getRecommendations() {
    return apiRequest('/recommendations/');
}

async function getComments(question_id) {
    return apiRequest(`/comments/?question_id=${question_id}`);
}

async function postComment(question_id, content, reply_to) {
    const body = { question_id, content };
    if (reply_to) body.reply_to = reply_to;
    return apiRequest('/comments/', { method: 'POST', body });
}
