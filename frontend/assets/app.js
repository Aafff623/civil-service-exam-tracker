
(function () {
  const now = new Date();
  const days = document.querySelectorAll('[data-today]');
  days.forEach(el => el.textContent = now.toLocaleDateString('zh-CN'));

  document.querySelectorAll('[data-demo-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-demo-action');
      const box = document.querySelector(`[data-demo-result="${target}"]`);
      if (!box) return;
      box.classList.remove('hidden');
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  const qaInput = document.querySelector('[data-qa-input]');
  const qaBtn = document.querySelector('[data-qa-send]');
  const qaChat = document.querySelector('[data-qa-chat]');
  function addBubble(text, type) {
    if (!qaChat || !text.trim()) return;
    const div = document.createElement('div');
    div.className = 'bubble ' + type;
    div.textContent = text;
    qaChat.appendChild(div);
    qaChat.scrollTop = qaChat.scrollHeight;
  }
  function sendQuestion() {
    if (!qaInput) return;
    const value = qaInput.value.trim();
    if (!value) return;
    addBubble(value, 'user');
    qaInput.value = '';
    setTimeout(() => addBubble('可以先定位题干关键词，再看选项是否偷换概念。这个原型里答疑内容是前端模拟数据，后续可接后端智能解析接口。', 'ai'), 260);
  }
  if (qaBtn) qaBtn.addEventListener('click', sendQuestion);
  if (qaInput) qaInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendQuestion(); });
})();
