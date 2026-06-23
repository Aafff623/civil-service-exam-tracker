document.addEventListener('DOMContentLoaded', async () => {
    const healthBox = document.getElementById('health-check');
    if (healthBox) {
        const result = await getHealth();
        if (result.ok && result.data.success) {
            healthBox.textContent = '服务运行正常';
            healthBox.className = 'status-box ok';
        } else {
            healthBox.textContent = '服务连接失败，请确保后端已启动';
            healthBox.className = 'status-box error';
        }
    }
});
