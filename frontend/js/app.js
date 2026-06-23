document.addEventListener('DOMContentLoaded', async () => {
    const healthBox = document.getElementById('health-check');
    if (healthBox) {
        const result = await getHealth();
        if (result.ok && result.data.success) {
            healthBox.textContent = '服务运行正常';
            healthBox.className = 'status-box ok';
        } else {
            healthBox.textContent = '服务连接失败，请确保后端已启动 (python backend/app.py)';
            healthBox.className = 'status-box error';
        }
    }

    // Protect dashboard: redirect to login if not authenticated
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'dashboard.html') {
        const result = await getMe();
        if (!result.ok || !result.data.success) {
            window.location.href = 'login.html';
            return;
        }
        const user = result.data.data;
        const header = document.querySelector('header h1');
        if (header) {
            header.textContent = `欢迎，${user.username}`;
        }
    }
});
