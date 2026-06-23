document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const result = await apiRequest('/auth/login', {
                method: 'POST',
                body: { username, password }
            });
            if (result.ok) {
                localStorage.setItem('user', JSON.stringify(result.data));
                window.location.href = 'dashboard.html';
            } else {
                alert(result.data.message || '登录失败');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const result = await apiRequest('/auth/register', {
                method: 'POST',
                body: { username, password }
            });
            if (result.ok) {
                alert('注册成功');
                window.location.href = 'login.html';
            } else {
                alert(result.data.message || '注册失败');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
});
