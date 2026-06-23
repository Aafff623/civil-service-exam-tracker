function resourceSlugFromUrl(url) {
    if (!url) return '';
    const m = String(url).match(/resources\/([^./]+)/i);
    return m ? m[1] : '';
}

const SUBJECT_THUMB_FALLBACK = {
    1: '03-gk-2025-xingce',
    2: '06-yanyu-chengyu',
    3: '08-shuliang-formulas',
    4: '10-tuili-tuxing',
    5: '11-ziliao-susuan',
    6: '12-changshi-shizheng',
    7: '13-shenlun-template'
};

const TYPE_THUMB_FALLBACK = {
    '大纲': '01-gk-2026-outline',
    '公告': '15-gk-2026-notice',
    '真题': '03-gk-2025-xingce',
    '模拟题': '05-mock-xingce-1',
    '资料': '02-prep-plan-guide'
};

function getResourceThumbSrc(item) {
    const slug = resourceSlugFromUrl(item.url);
    if (slug) return `assets/images/resources/${slug}.svg`;

    const subjectSlug = SUBJECT_THUMB_FALLBACK[item.subject_id];
    if (subjectSlug) return `assets/images/resources/${subjectSlug}.svg`;

    const typeSlug = TYPE_THUMB_FALLBACK[item.type];
    if (typeSlug) return `assets/images/resources/${typeSlug}.svg`;

    return 'assets/images/resources/02-prep-plan-guide.svg';
}

function resourceThumbHtml(item, options = {}) {
    const src = getResourceThumbSrc(item);
    const typeLabel = item.type || '资料';
    if (options.compact) {
        return `
            <div class="resource-thumb resource-thumb-compact">
                <img src="${escapeHtml(src)}" alt="" width="40" height="40" loading="lazy" />
            </div>`;
    }
    return `
        <div class="resource-thumb">
            <img src="${escapeHtml(src)}" alt="" width="56" height="56" loading="lazy" />
            <span class="resource-type-badge">${escapeHtml(typeLabel)}</span>
        </div>`;
}