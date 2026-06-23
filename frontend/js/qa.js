let currentQuestion = null;
let currentQuestionIndex = 0;
let questionsCache = [];
let practiceResourcesCache = [];

const PRACTICE_RESOURCE_TYPES = new Set(['真题', '模拟题', '资料']);

function normalizeAnswer(value = '') {
    const letters = [...new Set(String(value).toUpperCase().split('').filter(ch => 'ABCD'.includes(ch)))].sort();
    return letters.join('');
}

function isMultiSelectQuestion(q) {
    return q?.type === '多选';
}

function buildEmptyFilterMessage() {
    const typeSelect = document.getElementById('type-filter');
    const resourceSelect = document.getElementById('resource-filter');
    const subjectSelect = document.getElementById('subject-filter');

    if (typeSelect?.value === '多选') {
        return '当前筛选下暂无多选题，请切换答题形式或放宽科目、资料来源条件。';
    }
    if (typeSelect?.value === '判断') {
        return '当前筛选下暂无判断题，请切换答题形式或调整科目筛选。';
    }
    if (resourceSelect?.value) {
        return '该资料暂无匹配题目，请选择其他资料或返回';
    }
    if (subjectSelect?.value) {
        return '该科目暂无匹配题目，请切换科目或选择具体资料来源。';
    }
    return '暂无匹配题目，请调整筛选条件';
}

async function initQA() {
    if (!document.getElementById('question-detail')) return;

    await loadSubjectsForFilter();

    const params = new URLSearchParams(location.search);
    const subjectId = params.get('subject_id');
    const resourceId = params.get('resource_id');

    const subjectSelect = document.getElementById('subject-filter');
    if (subjectId && subjectSelect) {
        subjectSelect.value = subjectId;
    }

    await loadResourcesForFilter(subjectSelect?.value || '');
    const resourceSelect = document.getElementById('resource-filter');
    if (resourceId && resourceSelect) {
        resourceSelect.value = resourceId;
    }

    await applyQuestionFilters();
    await loadAnswerHistory();
    bindFilter();
    bindChat();
}

async function loadSubjectsForFilter() {
    const subjectSelect = document.getElementById('subject-filter');
    if (!subjectSelect) return;

    const result = await getSubjects();
    if (!result.ok || !result.data.success) return;

    const subjects = result.data.data.items || [];
    subjectSelect.innerHTML = '<option value="">全部科目</option>' +
        subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
}

async function loadResourcesForFilter(subjectId = '') {
    const resourceSelect = document.getElementById('resource-filter');
    if (!resourceSelect) return;

    const result = await getResources({ practice_only: 1 });
    if (!result.ok || !result.data.success) {
        resourceSelect.innerHTML = '<option value="">全部可练习资料</option>';
        return;
    }

    practiceResourcesCache = (result.data.data.items || []).filter(item =>
        PRACTICE_RESOURCE_TYPES.has(item.type) && Number(item.question_count) > 0
    );

    let items = practiceResourcesCache;
    if (subjectId) {
        items = items.filter(item => String(item.subject_id) === String(subjectId));
    }

    resourceSelect.innerHTML = '<option value="">全部可练习资料</option>' +
        items.map(item => {
            const count = Number(item.question_count) || 0;
            const label = `${item.title}（${item.type} · ${count} 题）`;
            return `<option value="${item.id}">${escapeHtml(label)}</option>`;
        }).join('');
}

function buildQuestionQueryParams() {
    const params = {};
    const subjectSelect = document.getElementById('subject-filter');
    const resourceSelect = document.getElementById('resource-filter');
    const typeSelect = document.getElementById('type-filter');

    if (subjectSelect?.value) params.subject_id = subjectSelect.value;
    if (resourceSelect?.value) params.resource_id = resourceSelect.value;
    if (typeSelect?.value) params.type = typeSelect.value;
    return params;
}

async function applyQuestionFilters() {
    await loadQuestions(buildQuestionQueryParams());
    updateFilterHint();
}

function updateFilterHint() {
    const hint = document.getElementById('qa-filter-hint');
    const resourceSelect = document.getElementById('resource-filter');
    if (!hint) return;

    if (resourceSelect?.value) {
        const option = resourceSelect.selectedOptions[0];
        hint.textContent = option
            ? `当前练习资料：${option.textContent}。题目来自该备考资源关联题库。`
            : '题目与「考试与资源」中的真题、模拟题、备考资料关联，可按资料筛选练习。';
        return;
    }

    hint.textContent = questionsCache.length
        ? `共 ${questionsCache.length} 道题，均关联考试与资源模块中的备考资料。`
        : '暂无匹配题目，请调整科目或资料来源筛选。';
}

async function loadQuestions(params = {}) {
    const list = document.getElementById('question-detail');
    if (!list) return;

    renderLoading(list, '加载题目中...');

    const result = await getQuestions({ ...params, per_page: 50 });
    if (!result.ok || !result.data.success) {
        list.innerHTML = '<p class="muted">加载失败，请稍后重试</p>';
        questionsCache = [];
        return;
    }

    questionsCache = result.data.data.items || [];
    currentQuestionIndex = 0;

    if (questionsCache.length === 0) {
        list.innerHTML = `<p class="muted">${buildEmptyFilterMessage()}。<a class="link" href="resources.html" style="margin-left:8px;">考试与资源</a></p>`;
        updateFilterHint();
        return;
    }

    renderQuestion();
    updateFilterHint();
}

function renderResourceLink(q) {
    if (!q.resource_id || !q.resource_title) return '';
    return `
        <a class="link" href="resource-detail.html?id=${encodeURIComponent(q.resource_id)}" style="font-size:13px;">
            出处：${escapeHtml(q.resource_title)}${q.resource_type ? `（${escapeHtml(q.resource_type)}）` : ''}
        </a>
    `;
}

function renderQuestion() {
    const container = document.getElementById('question-detail');
    const q = questionsCache[currentQuestionIndex];
    currentQuestion = q;

    const optionsHtml = (q.options || []).map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const text = opt.replace(/^[A-D]\.\s*/, '');
        return `
            <label class="option" data-option="${letter}">
                <span class="option-letter">${letter}</span>
                <span>${escapeHtml(text)}</span>
            </label>
        `;
    }).join('');

    const multiHint = isMultiSelectQuestion(q)
        ? '<p class="muted" style="margin:0 0 12px;font-size:13px;">本题为多选题，可选择多个选项后提交。</p>'
        : '';

    container.innerHTML = `
        <div class="card-title">
            <h2>题目详情</h2>
            <div>
                <span class="tag">${escapeHtml(q.type)}</span>
                <span class="tag gray">${currentQuestionIndex + 1} / ${questionsCache.length}</span>
                <span class="tag gray">${escapeHtml(q.subject_name || '通用')}</span>
                ${q.resource_type ? `<span class="tag blue">${escapeHtml(q.resource_type)}</span>` : ''}
            </div>
        </div>
        ${renderResourceLink(q) ? `<p style="margin:0 0 14px;">${renderResourceLink(q)}</p>` : ''}
        <div class="question-card" id="question-card">
            <p class="question-stem">${escapeHtml(q.content)}</p>
            ${multiHint}
            ${optionsHtml}
        </div>
        <div id="answer-result" style="margin-top:18px; display:none;"></div>
        <div style="margin-top:18px; display:flex; gap:10px; justify-content:flex-end;">
            <button class="btn ghost" id="prev-question" ${currentQuestionIndex === 0 ? 'disabled' : ''}>上一题</button>
            <button class="btn primary" id="submit-answer">提交答案</button>
            <button class="btn ghost" id="next-question" ${currentQuestionIndex >= questionsCache.length - 1 ? 'disabled' : ''}>下一题</button>
        </div>
    `;

    bindQuestionInteractions();
}

function bindQuestionInteractions() {
    const card = document.getElementById('question-card');
    if (!card) return;

    const multi = isMultiSelectQuestion(currentQuestion);
    card.querySelectorAll('[data-option]').forEach(label => {
        label.addEventListener('click', () => {
            if (multi) {
                label.classList.toggle('selected');
                return;
            }
            card.querySelectorAll('[data-option]').forEach(el => el.classList.remove('selected'));
            label.classList.add('selected');
        });
    });

    const submitBtn = document.getElementById('submit-answer');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitCurrentAnswer);
    }

    const prevBtn = document.getElementById('prev-question');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderQuestion();
            }
        });
    }

    const nextBtn = document.getElementById('next-question');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentQuestionIndex < questionsCache.length - 1) {
                currentQuestionIndex++;
                renderQuestion();
            }
        });
    }
}

async function submitCurrentAnswer() {
    const card = document.getElementById('question-card');
    const multi = isMultiSelectQuestion(currentQuestion);
    const selectedNodes = [...card.querySelectorAll('[data-option].selected')];
    if (!selectedNodes.length) {
        showToast(multi ? '请至少选择一个答案' : '请先选择一个答案', 'error');
        return;
    }

    const selectedAnswer = normalizeAnswer(selectedNodes.map(node => node.getAttribute('data-option')).join(''));
    const submitBtn = document.getElementById('submit-answer');
    setButtonLoading(submitBtn, true, '提交中');
    const result = await submitAnswer(currentQuestion.id, selectedAnswer);
    setButtonLoading(submitBtn, false);
    const resultBox = document.getElementById('answer-result');

    if (!result.ok || !result.data.success) {
        resultBox.innerHTML = `<p class="muted">提交失败：${escapeHtml(result.data.message || '未知错误')}</p>`;
        resultBox.style.display = 'block';
        return;
    }

    const data = result.data.data;
    const q = currentQuestion;

    const normalizedCorrect = normalizeAnswer(data.correct_answer);
    const selectedLetters = new Set(selectedAnswer.split(''));
    const correctLetters = new Set(normalizedCorrect.split(''));

    card.querySelectorAll('[data-option]').forEach(label => {
        const letter = label.getAttribute('data-option');
        if (correctLetters.has(letter)) {
            label.classList.add('correct');
        } else if (selectedLetters.has(letter)) {
            label.classList.add('wrong');
        }
    });

    const resourceNote = q.resource_id
        ? `<p class="muted" style="margin-top:10px;font-size:13px;">本题出自 <a class="link" href="resource-detail.html?id=${encodeURIComponent(q.resource_id)}">${escapeHtml(q.resource_title || '关联资料')}</a>，可返回资料页查看完整章节。</p>`
        : '';

    resultBox.innerHTML = `
        <div class="grid grid-2">
            <div class="analysis-box">
                <span class="analysis-label">答题结果</span>
                ${data.is_correct
                    ? '<span class="tag green">回答正确</span>'
                    : `<span class="tag red">回答错误</span> 你的答案：${escapeHtml(selectedAnswer)}`
                }
                <br/>正确答案：<span class="tag green">${escapeHtml(normalizedCorrect || data.correct_answer)}</span>
            </div>
            <div class="analysis-box">
                <span class="analysis-label">答题技巧</span>${escapeHtml(data.tips || '暂无技巧')}
            </div>
        </div>
        <div class="analysis-box" style="margin-top:14px;">
            <span class="analysis-label">题目解析</span>${escapeHtml(data.explanation || '暂无解析')}
        </div>
        ${resourceNote}
    `;
    resultBox.style.display = 'block';

    if (submitBtn) submitBtn.disabled = true;

    showToast(data.is_correct ? '回答正确' : '回答错误，查看解析', data.is_correct ? 'success' : 'info');
    loadAnswerHistory();
}

async function loadAnswerHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;

    const result = await getAnswerHistory();
    if (!result.ok || !result.data.success) {
        list.innerHTML = '<p class="muted">暂无答题记录</p>';
        return;
    }

    const items = result.data.data.items || [];
    if (!items.length) {
        list.innerHTML = '<p class="muted">暂无答题记录</p>';
        return;
    }

    list.innerHTML = items.slice(0, 8).map(item => `
        <div class="list-item">
            <span class="tag ${item.is_correct ? 'green' : 'red'}">${item.is_correct ? '正确' : '错误'}</span>
            <div class="task-text">
                <span class="list-title">${escapeHtml((item.content || '').slice(0, 48))}${(item.content || '').length > 48 ? '…' : ''}</span>
                <span>${escapeHtml(item.subject_name || '')}</span>
            </div>
            <span class="muted" style="font-size:12px; white-space:nowrap;">${escapeHtml(item.selected_answer)} → ${escapeHtml(item.correct_answer)}</span>
        </div>
    `).join('');
}

function bindFilter() {
    const subjectSelect = document.getElementById('subject-filter');
    const resourceSelect = document.getElementById('resource-filter');
    const typeSelect = document.getElementById('type-filter');

    async function onSubjectChange() {
        const prevResource = resourceSelect?.value || '';
        await loadResourcesForFilter(subjectSelect?.value || '');
        if (prevResource && resourceSelect) {
            const stillValid = [...resourceSelect.options].some(opt => opt.value === prevResource);
            resourceSelect.value = stillValid ? prevResource : '';
        }
        await applyQuestionFilters();
    }

    if (subjectSelect) subjectSelect.addEventListener('change', onSubjectChange);
    if (resourceSelect) resourceSelect.addEventListener('change', applyQuestionFilters);
    if (typeSelect) typeSelect.addEventListener('change', applyQuestionFilters);
}

function bindChat() {
    const input = document.querySelector('[data-qa-input]');
    const btn = document.querySelector('[data-qa-send]');
    const chat = document.querySelector('[data-qa-chat]');

    function addBubble(text, type) {
        if (!chat || !text.trim()) return;
        const div = document.createElement('div');
        div.className = type === 'user' ? 'note-item is-user' : 'note-item is-reply';
        div.textContent = text;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    async function send() {
        if (!input) return;
        const value = input.value.trim();
        if (!value) return;
        addBubble(value, 'user');
        input.value = '';

        if (currentQuestion) {
            const commentResult = await postComment(currentQuestion.id, value);
            if (commentResult.ok && commentResult.data.success) {
                addBubble('你的疑问已记录。针对这道题，建议先定位题干关键词，再逐项排除偷换概念的选项。', 'ai');
            } else {
                addBubble(`针对这道${currentQuestion.subject_name || ''}题，建议先定位题干关键词，再逐项排除偷换概念的选项。`, 'ai');
            }
        } else {
            addBubble('请先选择一道题目，再提交你的疑问。', 'ai');
        }
    }

    if (btn) btn.addEventListener('click', send);
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
}

let qaBooted = false;

function bootQA() {
    if (qaBooted || !document.getElementById('question-detail')) return;
    qaBooted = true;
    initQA();
}
window.addEventListener('app:ready', bootQA, { once: true });
bootQA();