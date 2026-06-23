function showFormError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

function clearFormError(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const loginUsername = document.getElementById('username');
    const loginPassword = document.getElementById('password');
    if (loginUsername && !loginUsername.value) loginUsername.value = 'root';
    if (loginPassword && !loginPassword.value) loginPassword.value = '123456';

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormError('login-error');
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const btn = document.getElementById('login-btn');

            setButtonLoading(btn, true, '登录中');
            const result = await login(username, password);
            setButtonLoading(btn, false);

            if (result.ok && result.data.success) {
                localStorage.setItem('user', JSON.stringify(result.data.data));
                showToast('登录成功', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 400);
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

            setButtonLoading(btn, true, '注册中');
            const result = await register(username, password);
            setButtonLoading(btn, false);

            if (result.ok && result.data.success) {
                showToast('注册成功，请登录', 'success');
                setTimeout(() => { window.location.href = 'login.html'; }, 800);
            } else {
                showFormError('register-error', result.data.message || '注册失败');
            }
        });
    }
});