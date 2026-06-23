document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const result = await login(username, password);
            if (result.ok && result.data.success) {
                localStorage.setItem('user', JSON.stringify(result.data.data));
                window.location.href = 'dashboard.html';
            } else {
                alert(result.data.message || '登录失败');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            if (password.length < 6) {
                alert('密码至少 6 位');
                return;
            }
            const result = await register(username, password);
            if (result.ok && result.data.success) {
                alert('注册成功，请登录');
                window.location.href = 'login.html';
            } else {
                alert(result.data.message || '注册失败');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
});
