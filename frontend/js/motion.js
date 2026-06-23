(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => resolve();
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    function animateCount(el, endValue, suffix, decimals) {
        if (!el || reduced || typeof gsap === 'undefined') {
            if (el) el.innerHTML = formatKpiValue(endValue, suffix, decimals);
            return;
        }
        const obj = { val: 0 };
        gsap.to(obj, {
            val: endValue,
            duration: 0.45,
            ease: 'power2.out',
            onUpdate: () => {
                el.innerHTML = formatKpiValue(obj.val, suffix, decimals);
            }
        });
    }

    function formatKpiValue(val, suffix, decimals) {
        const n = decimals ? Number(val).toFixed(decimals) : Math.round(val);
        return suffix ? `${n}<small>${suffix}</small>` : String(n);
    }

    function parseKpiNumber(html) {
        if (!html) return null;
        const m = String(html).match(/([\d.]+)/);
        return m ? parseFloat(m[1]) : null;
    }

    function dashboardEnter() {
        if (reduced || typeof gsap === 'undefined') return;

        const kpis = document.querySelectorAll('.motion-kpi');
        if (kpis.length) {
            gsap.from(kpis, {
                opacity: 0,
                y: 14,
                duration: 0.35,
                stagger: 0.07,
                ease: 'power2.out'
            });
        }

        const sections = document.querySelectorAll('.motion-section');
        if (sections.length) {
            gsap.from(sections, {
                opacity: 0,
                y: 10,
                duration: 0.32,
                stagger: 0.1,
                delay: 0.12,
                ease: 'power2.out'
            });
        }
    }

    function bindKpiObservers() {
        const ids = [
            { id: 'kpi-tasks', suffix: '项', decimals: 0, parse: el => {
                const t = el.textContent || '';
                const parts = t.split('/');
                return parts.length === 2 ? parseFloat(parts[0]) : null;
            }},
            { id: 'kpi-hours', suffix: 'h', decimals: 1 },
            { id: 'kpi-rate', suffix: '%', decimals: 0 },
            { id: 'kpi-streak', suffix: '天', decimals: 0 }
        ];

        ids.forEach(cfg => {
            const el = document.getElementById(cfg.id);
            if (!el) return;

            const observer = new MutationObserver(() => {
                if (el.querySelector('.skeleton-inline')) return;
                const val = cfg.parse ? cfg.parse(el) : parseKpiNumber(el.innerHTML);
                if (val === null || Number.isNaN(val)) return;
                observer.disconnect();
                animateCount(el, val, cfg.suffix, cfg.decimals);
            });
            observer.observe(el, { childList: true, subtree: true, characterData: true });
        });
    }

    function animateRing(targetPct) {
        const ring = document.getElementById('dashboard-progress-ring');
        const text = document.getElementById('dashboard-progress-text');
        if (!ring) return;

        const circumference = 283;
        const offset = circumference * (1 - (targetPct || 0) / 100);
        ring.setAttribute('stroke', 'var(--color-accent)');

        if (reduced || typeof gsap === 'undefined') {
            ring.setAttribute('stroke-dashoffset', String(offset));
            if (text) text.textContent = `${Math.round(targetPct || 0)}%`;
            return;
        }

        const obj = { pct: 0 };
        gsap.to(obj, {
            pct: targetPct || 0,
            duration: 0.5,
            ease: 'power2.out',
            onUpdate: () => {
                const p = obj.pct;
                ring.setAttribute('stroke-dashoffset', String(circumference * (1 - p / 100)));
                if (text) text.textContent = `${Math.round(p)}%`;
            }
        });
    }

    function animatePrepBar(pct) {
        const bar = document.getElementById('dashboard-prep-bar');
        const label = document.getElementById('dashboard-prep-percent');
        if (!bar) return;

        if (reduced || typeof gsap === 'undefined') {
            bar.style.width = `${pct}%`;
            if (label) label.textContent = `${pct}%`;
            return;
        }

        gsap.to(bar, { width: `${pct}%`, duration: 0.45, ease: 'power2.out' });
        if (label) {
            const obj = { v: 0 };
            gsap.to(obj, {
                v: pct,
                duration: 0.45,
                ease: 'power2.out',
                onUpdate: () => { label.textContent = `${Math.round(obj.v)}%`; }
            });
        }
    }

    function animateCountdown(days) {
        const el = document.getElementById('dashboard-countdown-days');
        if (!el || days === null) return;

        if (reduced || typeof gsap === 'undefined') {
            el.innerHTML = `${days}<small>天</small>`;
            return;
        }

        const obj = { v: 0 };
        gsap.to(obj, {
            v: days,
            duration: 0.5,
            ease: 'power2.out',
            onUpdate: () => {
                el.innerHTML = `${Math.round(obj.v)}<small>天</small>`;
            }
        });
    }

    window.MotionKit = {
        dashboardEnter,
        bindKpiObservers,
        animateRing,
        animatePrepBar,
        animateCountdown,
        playTaskFlip(list, state) {
            if (reduced || typeof Flip === 'undefined' || !list || !state) {
                return false;
            }
            Flip.from(state, {
                duration: 0.32,
                ease: 'power2.inOut',
                absolute: true,
                nested: true
            });
            return true;
        },
        captureTaskState(list) {
            if (typeof Flip === 'undefined' || !list) return null;
            return Flip.getState(list.querySelectorAll('.task-item[data-task-id]'));
        }
    };

    async function initMotion() {
        if (!document.getElementById('dashboard-tasks')) return;

        try {
            await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/Flip.min.js');
            if (typeof gsap !== 'undefined' && typeof Flip !== 'undefined') {
                gsap.registerPlugin(Flip);
            }
        } catch (_) {
            return;
        }

        bindKpiObservers();
        window.addEventListener('app:ready', () => {
            dashboardEnter();
        }, { once: true });
        if (document.body.classList.contains('app-ready')) dashboardEnter();
    }

    initMotion();
})();