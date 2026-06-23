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

    const NAV_EMOJI = {
        'dashboard.html': '🏠',
        'index.html': '🏠',
        'resources.html': '📚',
        'resource-detail.html': '📚',
        'plan.html': '🗓️',
        'recommendations.html': '✨',
        'statistics.html': '📈',
        'qa.html': '✍️'
    };

    const PAGE_EMOJI = {
        'dashboard.html': '📊',
        'index.html': '🧭',
        'resources.html': '📚',
        'resource-detail.html': '📄',
        'plan.html': '🗓️',
        'recommendations.html': '✨',
        'statistics.html': '📈',
        'qa.html': '✍️'
    };

    const KPI_EMOJIS = ['✅', '⏱️', '📈', '🔥', '🏆'];

    const PAGE_BANNERS = {
        'plan.html': {
            src: 'assets/images/plan-calendar.jpg',
            alt: '学习计划示意图',
            text: '🗓️ 按目标拆解每周任务，一步步推进备考节奏'
        },
        'statistics.html': {
            src: 'assets/images/stats-analytics.jpg',
            alt: '学习统计示意图',
            text: '📈 用数据看清时长、正确率与打卡习惯'
        },
        'qa.html': {
            src: 'assets/images/qa-practice.jpg',
            alt: '题库练习示意图',
            text: '✍️ 刷题、看解析、留言记录疑问'
        },
        'resources.html': {
            src: 'assets/images/resources-library.jpg',
            alt: '考试资源库示意图',
            text: '📚 大纲、真题、资料与公告一站检索'
        }
    };
    const MODULE_EMOJIS = ['📊', '📚', '🗓️', '✨', '📈', '✍️'];

    const HEADING_EMOJIS = {
        '今日任务清单': '📋',
        '弱项提醒': '💡',
        '考试倒计时': '⏳',
        '学习热力图': '🗓️',
        '考试时间线': '📅',
        '薄弱模块': '🎯',
        '学习偏好': '💫',
        '学习目标': '🏁',
        '为你推荐': '🎁',
        '题目筛选': '🔍',
        '最近答题': '📝',
        '题目留言': '💬',
        '输入学习目标': '🎯',
        '生成结果预览': '📋',
        '强化弱项': '💪',
        '真题驱动': '📑',
        '错题复盘': '🔁',
        '时间管理': '⏰',
        '学习时长趋势': '📉',
        '科目正确率': '🎯',
        '连续打卡': '🔥',
        '本周学习安排': '📆',
        '未来 7 天任务预览': '🔮',
        '知识水平参考': '🧠',
        '科目重要性 & 难易度': '⚖️'
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
            const emoji = NAV_EMOJI[href];
            const label = link.querySelector('span:last-child');
            if (emoji && label && !label.querySelector('.nav-emoji')) {
                label.insertAdjacentHTML('afterbegin', `<span class="nav-emoji" aria-hidden="true">${emoji}</span>`);
            }
        });
    }

    function upgradeSidebarFooter() {
        document.querySelectorAll('.sidebar-footer').forEach(el => {
            el.innerHTML = '🎯 备考有迹可循<br/>📋 计划 · 📈 进度 · ✍️ 练习';
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

    function decoratePageTitle() {
        const page = (location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
        const emoji = PAGE_EMOJI[page];
        const title = document.querySelector('.page-title');
        if (!emoji || !title || title.querySelector('.page-emoji')) return;
        title.insertAdjacentHTML('afterbegin', `<span class="page-emoji" aria-hidden="true">${emoji}</span>`);
    }

    function decorateKpiLabels() {
        document.querySelectorAll('.kpi .kpi-label').forEach((el, i) => {
            if (el.querySelector('.kpi-emoji')) return;
            const emoji = KPI_EMOJIS[i % KPI_EMOJIS.length];
            el.insertAdjacentHTML('afterbegin', `<span class="kpi-emoji" aria-hidden="true">${emoji}</span>`);
        });
    }

    function decorateHeadings() {
        document.querySelectorAll('.card-title h2, .card-title h3, .card > h3').forEach(el => {
            const text = (el.textContent || '').trim();
            const emoji = HEADING_EMOJIS[text];
            if (!emoji || el.querySelector('.heading-emoji')) return;
            el.insertAdjacentHTML('afterbegin', `<span class="heading-emoji" aria-hidden="true">${emoji}</span>`);
        });
        const greeting = document.querySelector('.welcome-title h2, .card-title h2');
        if (greeting && greeting.textContent.includes('你好') && !greeting.textContent.includes('👋')) {
            const user = greeting.querySelector('[data-username]');
            if (user) user.insertAdjacentHTML('afterend', ' 👋');
        }
    }

    function decorateModuleLinks() {
        document.querySelectorAll('.module-link h2').forEach((el, i) => {
            if (el.querySelector('.module-emoji')) return;
            const emoji = MODULE_EMOJIS[i % MODULE_EMOJIS.length];
            el.insertAdjacentHTML('afterbegin', `<span class="module-emoji" aria-hidden="true">${emoji}</span>`);
        });
    }

    function injectHeroVisual() {
        const hero = document.querySelector('.overview-hero');
        if (!hero || hero.querySelector('.overview-hero-visual')) return;
        hero.classList.add('overview-hero-split');
        const visual = document.createElement('div');
        visual.className = 'overview-hero-visual';
        visual.innerHTML = '<img src="assets/images/hero-study.jpg" alt="备考学习场景示意图" loading="lazy" width="480" height="270" />';
        hero.appendChild(visual);
    }

    function injectPageBanner() {
        const page = (location.pathname.split('/').pop() || '').toLowerCase();
        const cfg = PAGE_BANNERS[page];
        const main = document.querySelector('.main');
        if (!cfg || !main || main.querySelector('.page-banner')) return;

        const banner = document.createElement('section');
        banner.className = 'page-banner';
        banner.innerHTML = `
            <img src="${cfg.src}" alt="${cfg.alt}" loading="lazy" width="360" height="200" />
            <p class="muted">${cfg.text}</p>`;

        const header = main.querySelector('header.topbar');
        if (header) header.insertAdjacentElement('afterend', banner);
        else main.insertAdjacentElement('afterbegin', banner);
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
        decoratePageTitle();
        decorateKpiLabels();
        decorateHeadings();
        decorateModuleLinks();
        injectHeroVisual();
        injectPageBanner();
        markMotionTargets();
    }
})();