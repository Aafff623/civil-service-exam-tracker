// Mock API fallback layer.
// Loaded before api.js; provides isMockMode() and mockApiRequest().

(function () {
    const MOCK_KEY = 'MOCK_MODE';

    // URL-param bootstrap: ?mock=1 enables, ?mock=0 disables
    (function initMockModeFromUrl() {
        try {
            const params = new URLSearchParams(location.search);
            if (params.get('mock') === '1') {
                localStorage.setItem(MOCK_KEY, '1');
            } else if (params.get('mock') === '0') {
                localStorage.removeItem(MOCK_KEY);
            }
        } catch (_) { /* ignore */ }
    })();

    function isMockMode() {
        try {
            return localStorage.getItem(MOCK_KEY) === '1' || sessionStorage.getItem(MOCK_KEY) === '1';
        } catch (_) {
            return false;
        }
    }

    function setMockMode(enabled) {
        try {
            if (enabled) localStorage.setItem(MOCK_KEY, '1');
            else localStorage.removeItem(MOCK_KEY);
        } catch (_) { /* ignore */ }
    }

    let mockCurrentUser = null;
    function setMockCurrentUser(user) {
        mockCurrentUser = user;
    }

    function getBody(options) {
        if (!options || !options.body) return {};
        if (typeof options.body === 'string') {
            try { return JSON.parse(options.body); } catch (_) { return {}; }
        }
        return options.body;
    }

    function parseEndpoint(endpoint) {
        const [path, query] = endpoint.split('?');
        const params = {};
        if (query) {
            new URLSearchParams('?' + query).forEach((value, key) => {
                params[key] = value;
            });
        }
        return { path, params };
    }

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // In-memory mutable state for write operations
    const mockState = {
        answers: [],
        comments: [],
        planItems: [],
        resources: [],
        subjects: [],
        goal: null,
        currentUser: null
    };

    function initState() {
        const answersData = MOCK_DATA['/answers/history']?.data?.items || [];
        mockState.answers = clone(answersData);

        const commentsData = MOCK_DATA['/comments/']?.data?.items || [];
        mockState.comments = clone(commentsData);

        const planItemsData = MOCK_DATA['/plans/items']?.data?.items || [];
        mockState.planItems = clone(planItemsData);

        const resourcesData = MOCK_DATA['/resources/']?.data?.items || [];
        mockState.resources = clone(resourcesData);

        const subjectsData = MOCK_DATA['/subjects/']?.data?.items || [];
        mockState.subjects = clone(subjectsData);

        mockState.goal = clone(MOCK_DATA['/plans/goal']?.data || null);
        mockState.currentUser = clone(MOCK_DATA['/auth/me']?.data || null);
    }

    function ensureState() {
        if (!mockState.resources.length && MOCK_DATA['/resources/']?.data?.items?.length) {
            initState();
        }
    }

    function isAdmin() {
        return mockState.currentUser?.role === 'admin';
    }

    function success(data) {
        return { ok: true, status: 200, data: { success: true, data } };
    }

    function error(status, message) {
        return { ok: false, status, data: { success: false, message } };
    }

    function matchResourceById(path) {
        const m = path.match(/^\/resources\/(\d+)$/);
        if (!m) return null;
        const id = parseInt(m[1], 10);
        const item = mockState.resources.find(r => r.id === id) ||
            (MOCK_DATA[`/resources/${id}`]?.data);
        return item ? clone(item) : null;
    }

    function matchQuestionById(path) {
        const m = path.match(/^\/questions\/(\d+)$/);
        if (!m) return null;
        const id = parseInt(m[1], 10);
        const all = MOCK_DATA['/questions/all']?.data?.items || MOCK_DATA['/questions/']?.data?.items || [];
        const item = all.find(q => q.id === id);
        return item ? clone(item) : null;
    }

    function filterResources(params) {
        let items = clone(mockState.resources);
        if (params.subject_id) {
            items = items.filter(r => String(r.subject_id) === String(params.subject_id));
        }
        if (params.type) {
            items = items.filter(r => r.type === params.type);
        }
        if (params.has_questions) {
            items = items.filter(r => Number(r.question_count) > 0);
        }
        if (params.practice_only) {
            const practiceTypes = new Set(['真题', '模拟题', '资料']);
            items = items.filter(r => practiceTypes.has(r.type) && Number(r.question_count) > 0);
        }
        return items;
    }

    function filterQuestions(params) {
        const all = MOCK_DATA['/questions/all']?.data?.items || [];
        let items = clone(all);
        if (params.subject_id) {
            items = items.filter(q => String(q.subject_id) === String(params.subject_id));
        }
        if (params.resource_id) {
            items = items.filter(q => String(q.resource_id) === String(params.resource_id));
        }
        if (params.type) {
            items = items.filter(q => q.type === params.type);
        }

        const total = items.length;
        const page = Math.max(1, parseInt(params.page, 10) || 1);
        const perPage = Math.max(1, parseInt(params.per_page, 10) || 50);
        const start = (page - 1) * perPage;
        const paginated = items.slice(start, start + perPage);

        return { items: paginated, total, page, per_page: perPage };
    }

    function filterPlanItems(params) {
        let items = clone(mockState.planItems);
        if (params.date) {
            items = items.filter(p => p.item_date === params.date);
        }
        if (params.from && params.to) {
            items = items.filter(p => p.item_date >= params.from && p.item_date <= params.to);
        }
        return items;
    }

    function filterComments(params) {
        let items = clone(mockState.comments);
        if (params.question_id) {
            items = items.filter(c => String(c.question_id) === String(params.question_id));
        }
        return items;
    }

    function normalizeAnswer(value) {
        const letters = [...new Set(String(value).toUpperCase().split('').filter(ch => 'ABCD'.includes(ch)))].sort();
        return letters.join('');
    }

    function buildAnswerHistory() {
        const allQuestions = MOCK_DATA['/questions/all']?.data?.items || MOCK_DATA['/questions/']?.data?.items || [];
        const qmap = new Map(allQuestions.map(q => [q.id, q]));
        return mockState.answers.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).map(a => {
            const q = qmap.get(a.question_id);
            return {
                id: a.id,
                question_id: a.question_id,
                content: q?.content || '',
                selected_answer: a.selected_answer,
                correct_answer: q?.correct_answer || a.correct_answer || '',
                is_correct: a.is_correct,
                subject_id: q?.subject_id || null,
                subject_name: q?.subject_name || '',
                created_at: a.created_at
            };
        });
    }

    async function handleMockWrite(path, params, options) {
        ensureState();
        const body = getBody(options);
        const method = (options.method || 'GET').toUpperCase();

        // Auth
        if (path === '/auth/login' && method === 'POST') {
            const username = body.username || 'root';
            const user = clone(MOCK_DATA['/auth/me']?.data || { id: 1, username, role: 'admin' });
            user.username = username;
            mockState.currentUser = user;
            return success(user);
        }

        if (path === '/auth/register' && method === 'POST') {
            const username = body.username || 'newuser';
            return success({ id: 5, username, role: 'user' });
        }

        if (path === '/auth/logout' && method === 'POST') {
            mockState.currentUser = null;
            return success({});
        }

        // Subjects
        if (path === '/subjects/' && method === 'POST') {
            if (!isAdmin()) return error(403, '需要管理员权限');
            const newId = Math.max(1, ...mockState.subjects.map(s => s.id)) + 1;
            const newSubject = {
                id: newId,
                name: body.name,
                parent_id: null,
                weight: 1.0,
                difficulty: 1.0,
                created_at: new Date().toISOString()
            };
            mockState.subjects.push(newSubject);
            return success(newSubject);
        }

        // Resources
        if (path === '/resources/' && method === 'POST') {
            if (!isAdmin()) return error(403, '需要管理员权限');
            const newId = Math.max(1, ...mockState.resources.map(r => r.id || 0)) + 1;
            const sid = body.subject_id ? parseInt(body.subject_id, 10) : null;
            const subject = mockState.subjects.find(s => s.id === sid);
            const newResource = {
                id: newId,
                subject_id: sid,
                title: body.title || '未命名资源',
                type: body.type || '资料',
                content: body.content || '',
                url: body.url || '',
                created_at: new Date().toISOString(),
                subject_name: subject?.name || '通用',
                question_count: 0
            };
            mockState.resources.push(newResource);
            return success(newResource);
        }

        const resourceDeleteMatch = path.match(/^\/resources\/(\d+)$/);
        if (resourceDeleteMatch && method === 'DELETE') {
            if (!isAdmin()) return error(403, '需要管理员权限');
            const id = parseInt(resourceDeleteMatch[1], 10);
            mockState.resources = mockState.resources.filter(r => r.id !== id);
            return success({ id });
        }

        if (path === '/resources/batch-delete' && method === 'POST') {
            if (!isAdmin()) return error(403, '需要管理员权限');
            const ids = body.ids || [];
            mockState.resources = mockState.resources.filter(r => !ids.includes(r.id));
            return success({ deleted: ids.length });
        }

        // Answers
        if (path === '/answers/' && method === 'POST') {
            const allQuestions = MOCK_DATA['/questions/all']?.data?.items || MOCK_DATA['/questions/']?.data?.items || [];
            const q = allQuestions.find(item => item.id === body.question_id);
            if (!q) return error(404, '题目不存在');

            let selected = (body.selected_answer || '').trim();
            let correct = q.correct_answer || '';
            let isCorrect = false;
            if (q.type === '判断') {
                selected = selected.toUpperCase() === 'A' ? '正确' : (selected.toUpperCase() === 'B' ? '错误' : selected);
                isCorrect = selected === correct;
            } else {
                selected = normalizeAnswer(selected);
                correct = normalizeAnswer(correct);
                isCorrect = selected === correct && selected.length > 0;
            }

            const record = {
                id: mockState.answers.length + 1,
                user_id: mockState.currentUser?.id || 1,
                question_id: q.id,
                selected_answer: selected,
                is_correct: isCorrect ? 1 : 0,
                created_at: new Date().toISOString(),
                content: q.content,
                subject_name: q.subject_name,
                correct_answer: q.correct_answer
            };
            mockState.answers.unshift(record);
            return success({
                question_id: q.id,
                selected_answer: selected,
                correct_answer: q.correct_answer,
                is_correct: isCorrect,
                explanation: q.explanation || '暂无解析',
                tips: q.tips || '暂无技巧',
                subject_id: q.subject_id,
                options: q.options || []
            });
        }

        // Plan goal
        if (path === '/plans/goal' && method === 'POST') {
            mockState.goal = { ...mockState.goal, ...body };
            return success(mockState.goal);
        }

        // Generate plan
        if (path === '/plans/generate' && method === 'POST') {
            const goal = body || mockState.goal || {};
            const start = new Date(goal.start_date || TODAY_ISO());
            const end = new Date(goal.exam_date || TODAY_ISO());
            const days = Math.max(1, Math.round((end - start) / 86400000));
            const weeks = Math.max(1, Math.round(days / 7));
            const items = weeks * 6;
            return success({
                plan_id: 1,
                total_items: items,
                total_days: days,
                total_weeks: weeks,
                phases: MOCK_DATA['/plans/generate']?.data?.phases || []
            });
        }

        // Plan items toggle
        const planItemMatch = path.match(/^\/plans\/items\/(\d+)$/);
        if (planItemMatch && method === 'PATCH') {
            const id = parseInt(planItemMatch[1], 10);
            const item = mockState.planItems.find(p => p.id === id);
            if (!item) return error(404, '任务不存在');
            item.is_completed = body.is_completed ? 1 : 0;
            return success({ id, is_completed: item.is_completed });
        }

        // Comments
        if (path === '/comments/' && method === 'POST') {
            const newId = mockState.comments.length + 1;
            const newComment = {
                id: newId,
                question_id: body.question_id,
                user_id: mockState.currentUser?.id || 1,
                content: body.content || '',
                reply_to: body.reply_to || null,
                created_at: new Date().toISOString(),
                username: mockState.currentUser?.username || 'root',
                is_mine: true
            };
            mockState.comments.push(newComment);
            return success(newComment);
        }

        return error(404, 'Mock endpoint not found: ' + path);
    }

    function TODAY_ISO() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    async function mockApiRequest(endpoint, options = {}) {
        ensureState();
        await delay(150 + Math.floor(Math.random() * 200));

        const { path, params } = parseEndpoint(endpoint);
        const method = (options.method || 'GET').toUpperCase();

        if (method !== 'GET') {
            return handleMockWrite(path, params, options);
        }

        // Auth
        if (path === '/auth/me') {
            return success(clone(mockState.currentUser || MOCK_DATA['/auth/me']?.data));
        }

        // Subjects
        if (path === '/subjects/') {
            return success({ items: clone(mockState.subjects) });
        }

        // Resources
        if (path === '/resources/') {
            return success({ items: filterResources(params) });
        }

        const resource = matchResourceById(path);
        if (resource) return success(resource);

        // Questions
        if (path === '/questions/') {
            const result = filterQuestions(params);
            return success(result);
        }

        const question = matchQuestionById(path);
        if (question) return success(question);

        // Answers / history
        if (path === '/answers/history') {
            return success({ items: buildAnswerHistory().slice(0, 8) });
        }

        // Plans
        if (path === '/plans/goal') return success(clone(mockState.goal));
        if (path === '/plans/') return success(clone(MOCK_DATA['/plans/']?.data));
        if (path === '/plans/generate') return success(clone(MOCK_DATA['/plans/generate']?.data));
        if (path === '/plans/items') return success({ items: filterPlanItems(params) });
        if (path === '/plans/subjects') return success(clone(MOCK_DATA['/plans/subjects']?.data));

        // Progress
        if (path === '/progress/') {
            const data = clone(MOCK_DATA['/progress/']?.data);
            if (params.days) {
                const days = parseInt(params.days, 10);
                data.daily_study_minutes = (data.daily_study_minutes || []).slice(-days);
            }
            return success(data);
        }

        // Recommendations
        if (path === '/recommendations/') {
            const data = clone(MOCK_DATA['/recommendations/']?.data);
            const completed = parseInt(MOCK_DATA['/plans/']?.data?.plan?.completed_items || 0, 10);
            const total = parseInt(MOCK_DATA['/plans/']?.data?.plan?.total_items || 1, 10);
            data.plan_progress = Math.round(completed / total * 100);
            return success(data);
        }

        // Comments
        if (path === '/comments/') {
            return success({ items: filterComments(params) });
        }

        if (MOCK_DATA[endpoint]) {
            return success(clone(MOCK_DATA[endpoint].data));
        }

        return error(404, 'Mock endpoint not found: ' + endpoint);
    }

    window.isMockMode = isMockMode;
    window.setMockMode = setMockMode;
    window.setMockCurrentUser = setMockCurrentUser;
    window.mockApiRequest = mockApiRequest;
})();
