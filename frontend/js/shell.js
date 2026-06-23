(function () {
    const NAV_ICONS = {
        'dashboard.html': 'home',
        'index.html': 'home',
        'resources.html': 'resources',
        'resource-detail.html': 'resources',
        'plan.html': 'plan',
        'recommendations.html': 'recommend',
        'statistics.html': 'statistics',
        'qa.html': 'qa'
    };

    function navIconSvg(id) {
        return `<svg class="icon" width="18" height="18" aria-hidden="true"><use href="assets/icons.svg#${id}"/></svg>`;
    }

    function upgradeNavIcons() {
        document.querySelectorAll('.nav a[href]').forEach(link => {
            const href = (link.getAttribute('href') || '').split('?')[0].toLowerCase();
            const iconId = NAV_ICONS[href];
            const slot = link.querySelector('.nav-icon');
            if (!iconId || !slot) return;
            slot.innerHTML = navIconSvg(iconId);
        });
    }

    function upgradeSidebarFooter() {
        document.querySelectorAll('.sidebar-footer').forEach(el => {
            el.innerHTML = '备考有迹可循<br/>计划 · 进度 · 练习';
        });
    }

    function removeTitleBadges() {
        document.querySelectorAll('.title-badge').forEach(el => el.remove());
    }

    function trimTopbar() {
        document.querySelectorAll('.topbar .search').forEach(el => {
            if (!el.querySelector('#resource-search')) el.remove();
        });
        document.querySelectorAll('.topbar .icon-btn').forEach(el => el.remove());
    }

    function markMotionTargets() {
        document.querySelectorAll('.grid-4 > .kpi').forEach((el, i) => {
            el.classList.add('motion-kpi');
            el.dataset.motionIndex = String(i);
        });
        document.querySelectorAll('.main > section').forEach((el, i) => {
            if (i > 0) el.classList.add('motion-section');
        });
    }

    if (document.querySelector('.app')) {
        upgradeNavIcons();
        upgradeSidebarFooter();
        removeTitleBadges();
        trimTopbar();
        markMotionTargets();
    }
})();