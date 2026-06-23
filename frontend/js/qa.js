let currentQuestion = null;
let currentQuestionIndex = 0;
let questionsCache = [];

async function initQA() {
    if (!document.getElementById('question-detail')) return;

    await loadSubjectsForFilter();

    const params = new URLSearchParams(location.search);
    const subjectId = params.get('subject_id');
    const subjectSelect = document.getElementById('subject-filter');
    if (subjectId && subjectSelect) {
        subjectSelect.value = subjectId;
    }

    await loadQuestions(subjectId ? { subject_id: subjectId } : {});
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

async function loadQuestions(params = {}) {
    const list = document.getElementById('question-detail');
    if (!list) return;

    renderLoading(list, '加载题目中...');

    const result = await getQuestions({ ...params, per_page: 50 });
    if (!result.ok || !result.data.success) {
        list.innerHTML = '<p class="muted">加载失败，请稍后重试</p>';
        return;
    }

    questionsCache = result.data.data.items || [];
    currentQuestionIndex = 0;

    if (questionsCache.length === 0) {
        list.innerHTML = '<p class="muted">暂无题目</p>';
        return;
    }

    renderQuestion();
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

    container.innerHTML = `
        <div class="card-title">
            <h2>题目详情</h2>
            <div>
                <span class="tag">${escapeHtml(q.type)}</span>
                <span class="tag gray">${currentQuestionIndex + 1} / ${questionsCache.length}</span>
                <span class="tag gray">${escapeHtml(q.subject_name || '通用')}</span>
            </div>
        </div>
        <div class="question-card" id="question-card">
            <p><strong>${escapeHtml(q.content)}</strong></p>
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

    card.querySelectorAll('[data-option]').forEach(label => {
        label.addEventListener('click', () => {
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
    const selected = card.querySelector('[data-option].selected');
    if (!selected) {
        showToast('请先选择一个答案', 'error');
        return;
    }

    const selectedAnswer = selected.getAttribute('data-option');
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

    // Highlight options
    card.querySelectorAll('[data-option]').forEach(label => {
        const letter = label.getAttribute('data-option');
        if (letter === data.correct_answer) {
            label.classList.add('correct');
        } else if (letter === selectedAnswer && letter !== data.correct_answer) {
            label.classList.add('wrong');
        }
    });

    resultBox.innerHTML = `
        <div class="grid grid-2">
            <div class="analysis-box">
                <strong>答题结果</strong><br/>
                ${data.is_correct
                    ? '<span class="tag green">回答正确</span>'
                    : `<span class="tag red">回答错误</span> 你的答案：${escapeHtml(selectedAnswer)}`
                }
                <br/>正确答案：<span class="tag green">${escapeHtml(data.correct_answer)}</span>
            </div>
            <div class="analysis-box">
                <strong>答题技巧</strong><br/>${escapeHtml(data.tips || '暂无技巧')}
            </div>
        </div>
        <div class="analysis-box" style="margin-top:14px;">
            <strong>题目解析</strong><br/>${escapeHtml(data.explanation || '暂无解析')}
        </div>
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
        list.innerHTML = '<p class="muted">加载失败</p>';
        return;
    }

    const items = result.data.data.items || [];
    if (items.length === 0) {
        list.innerHTML = '<p class="muted">暂无答题记录，完成练习后将显示在这里</p>';
        return;
    }

    list.innerHTML = items.slice(0, 8).map(item => `
        <div class="history-item" style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--line);">
            <div>
                <span class="tag ${item.is_correct ? 'green' : 'red'}">${item.is_correct ? '正确' : '错误'}</span>
                <span class="muted" style="margin-left:8px;">${escapeHtml(item.subject_name || '')}</span>
                <div style="margin-top:4px; font-size:14px;">${escapeHtml((item.question_content || '').slice(0, 40))}${(item.question_content || '').length > 40 ? '…' : ''}</div>
            </div>
            <span class="muted" style="font-size:12px; white-space:nowrap;">${escapeHtml(item.selected_answer)} → ${escapeHtml(item.correct_answer)}</span>
        </div>
    `).join('');
}

function bindFilter() {
    const subjectSelect = document.getElementById('subject-filter');
    const typeSelect = document.getElementById('type-filter');

    function applyFilter() {
        const params = {};
        if (subjectSelect && subjectSelect.value) params.subject_id = subjectSelect.value;
        if (typeSelect && typeSelect.value) params.type = typeSelect.value;
        loadQuestions(params);
    }

    if (subjectSelect) subjectSelect.addEventListener('change', applyFilter);
    if (typeSelect) typeSelect.addEventListener('change', applyFilter);
}

function bindChat() {
    const input = document.querySelector('[data-qa-input]');
    const btn = document.querySelector('[data-qa-send]');
    const chat = document.querySelector('[data-qa-chat]');

    function addBubble(text, type) {
        if (!chat || !text.trim()) return;
        const div = document.createElement('div');
        div.className = 'bubble ' + type;
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

function bootQA() {
    if (document.getElementById('question-detail')) initQA();
}
if (document.body.classList.contains('app-ready')) {
    bootQA();
} else {
    window.addEventListener('app:ready', bootQA, { once: true });
}
