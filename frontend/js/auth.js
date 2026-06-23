function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showFormError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
    }
}

function clearFormError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = '';
    }
}

function setLoading(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    const originalText = button.dataset.originalText || button.textContent;
    if (isLoading) {
        button.dataset.originalText = originalText;
        button.innerHTML = '<span class="spinner" style="border-color: rgba(255,255,255,0.3); border-top-color: white;"></span> 处理中...';
    } else {
        button.textContent = originalText;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormError('login-error');
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const btn = document.getElementById('login-btn');

            setLoading(btn, true);
            const result = await login(username, password);
            setLoading(btn, false);

            if (result.ok && result.data.success) {
                localStorage.setItem('user', JSON.stringify(result.data.data));
                showToast('登录成功', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                showFormError('login-error', result.data.message || '登录失败，请检查用户名和密码');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormError('register-error');
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const btn = document.getElementById('register-btn');

            if (password.length < 6) {
                showFormError('register-error', '密码至少 6 位');
                return;
            }

            setLoading(btn, true);
            const result = await register(username, password);
            setLoading(btn, false);

            if (result.ok && result.data.success) {
                showToast('注册成功，请登录', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            } else {
                showFormError('register-error', result.data.message || '注册失败');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
            localStorage.removeItem('user');
            showToast('已退出登录', 'info');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        });
    }
});
