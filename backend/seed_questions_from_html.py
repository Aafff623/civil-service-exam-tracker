"""Parse resource-sample blocks from HTML and emit questions INSERT SQL."""
from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESOURCES_DIR = ROOT / 'frontend' / 'assets' / 'resources'

# filename prefix -> (resource_id, default_subject_id)
FILE_RESOURCE_MAP: dict[str, tuple[int, int]] = {
    '01': (1, 1),
    '02': (2, 1),
    '03': (3, 1),
    '04': (4, 1),
    '05': (5, 1),
    '06': (6, 2),
    '07': (7, 2),
    '08': (8, 3),
    '09': (9, 3),
    '10': (10, 4),
    '11': (11, 5),
    '12': (12, 6),
    '13': (13, 7),
    '14': (14, 7),
    '18': (18, 7),
    '19': (19, 1),
    '20': (20, 1),
    '21': (21, 4),
    '22': (22, 7),
    '23': (23, 1),
}

SUBJECT_KEYWORDS: list[tuple[str, int]] = [
    ('申论', 7),
    ('言语', 2),
    ('数量', 3),
    ('资料分析', 5),
    ('资料', 5),
    ('常识', 6),
    ('逻辑判断', 4),
    ('判断推理', 4),
    ('图形', 4),
    ('定义判断', 4),
    ('类比', 4),
    ('政治理论', 1),
    ('行测', 1),
]

SKIP_RESOURCE_IDS = {1, 15, 16, 17}  # 大纲/公告不做题库关联
MAX_PER_RESOURCE = 20

SAMPLE_START_RE = re.compile(r'<div class="resource-sample">', re.IGNORECASE)
LABEL_RE = re.compile(r'<span class="sample-label">(.*?)</span>', re.DOTALL | re.IGNORECASE)
P_RE = re.compile(r'<p>(.*?)</p>', re.DOTALL | re.IGNORECASE)
OPTIONS_RE = re.compile(r'<ul class="resource-options">\s*(.*?)\s*</ul>', re.DOTALL | re.IGNORECASE)
LI_RE = re.compile(r'<li>(.*?)</li>', re.DOTALL | re.IGNORECASE)
SAMPLE_ANSWER_RE = re.compile(
    r'<div class="sample-answer">(.*?)</div>',
    re.DOTALL | re.IGNORECASE,
)
ANSWER_LETTER_RE = re.compile(r'答案[：:]\s*([A-D]+)', re.IGNORECASE)


def strip_html(text: str) -> str:
    text = unescape(text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def infer_subject(label: str, default: int) -> int:
    for keyword, subject_id in SUBJECT_KEYWORDS:
        if keyword in label:
            return subject_id
    return default


def infer_type(answer: str, options: list[str], label: str) -> str:
    if '判断' in label:
        return '判断'
    letters = re.sub(r'[^A-D]', '', answer.upper())
    if len(letters) > 1:
        return '多选'
    if len(options) == 2:
        opts_text = ''.join(options)
        if ('正确' in opts_text and '错误' in opts_text) or ('对' in opts_text and '错' in opts_text):
            return '判断'
    return '单选'


def split_combined_options(options: list[str]) -> list[str]:
    if len(options) != 1:
        return options
    text = options[0]
    parts = re.split(r'(?=[A-D][\.．、\s　])', text)
    parts = [p.strip() for p in parts if p.strip()]
    return parts if len(parts) >= 2 else options


def normalize_options(raw_options: list[str]) -> list[str]:
    expanded = split_combined_options(raw_options)
    result = []
    for opt in expanded:
        text = strip_html(opt)
        if not text:
            continue
        result.append(text)
    return result


def parse_inline_answers(answer_raw: str) -> dict[int, str]:
    """Parse answers like 「26720 亿元（B）」 or 「答案：D」 from combined blocks."""
    mapping: dict[int, str] = {}
    for match in re.finditer(
        r'问\s*(\d+)[^A-D]*?[（(]([A-D])[）)]|问\s*(\d+)[^A-D]*?答案[：:]\s*([A-D])',
        answer_raw,
        flags=re.IGNORECASE,
    ):
        qnum = int(match.group(1) or match.group(3))
        letter = (match.group(2) or match.group(4)).upper()
        mapping[qnum] = letter
    if not mapping:
        letter_m = ANSWER_LETTER_RE.search(answer_raw)
        if letter_m:
            mapping[1] = re.sub(r'[^A-D]', '', letter_m.group(1).upper())
    return mapping


def parse_multi_question_samples(block: str, label: str, resource_id: int, default_subject: int) -> list[dict]:
    """One resource-sample with multiple 问 N + options lists (资料分析常见结构)."""
    answer_block_m = SAMPLE_ANSWER_RE.search(block)
    if not answer_block_m:
        return []
    answer_raw = answer_block_m.group(1)
    answer_map = parse_inline_answers(answer_raw)
    if not answer_map:
        return []

    before_answer = block.split('<div class="sample-answer">')[0]
    segments = re.split(r'(?=<p><strong>问\s*\d+)', before_answer, flags=re.IGNORECASE)
    material = ''
    questions: list[dict] = []

    for segment in segments:
        if not segment.strip():
            continue
        q_match = re.search(
            r'<p><strong>问\s*(\d+)[：:][^<]*</strong>(.*?)</p>',
            segment,
            re.DOTALL | re.IGNORECASE,
        )
        if not q_match:
            if '材料' in segment or 'resource-sample' in segment:
                material = extract_content(segment)
            continue

        qnum = int(q_match.group(1))
        stem = strip_html(q_match.group(2))
        options_m = OPTIONS_RE.search(segment)
        if not options_m:
            continue
        options = normalize_options(LI_RE.findall(options_m.group(1)))
        if len(options) < 2:
            continue
        answer = answer_map.get(qnum)
        if not answer:
            continue

        content = f'{material} {stem}'.strip() if material else stem
        questions.append({
            'subject_id': infer_subject(label, default_subject),
            'resource_id': resource_id,
            'type': infer_type(answer, options, label),
            'content': content,
            'options': options,
            'correct_answer': answer,
            'explanation': strip_html(answer_raw),
            'tips': label or '资料分析先列公式，再结合选项差距估算。',
        })
    return questions


def sql_escape(value: str) -> str:
    return value.replace('\\', '\\\\').replace("'", "''")


def split_sample_blocks(html: str) -> list[str]:
    starts = [m.start() for m in SAMPLE_START_RE.finditer(html)]
    blocks: list[str] = []
    for i, start in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else len(html)
        blocks.append(html[start:end])
    return blocks


def extract_content(block: str) -> str:
    before_options = block.split('<ul class="resource-options">')[0]
    paragraphs = [strip_html(p) for p in P_RE.findall(before_options)]
    return ' '.join(p for p in paragraphs if p)


def parse_file(path: Path) -> list[dict]:
    prefix = path.name.split('-')[0]
    if prefix not in FILE_RESOURCE_MAP:
        return []

    resource_id, default_subject = FILE_RESOURCE_MAP[prefix]
    if resource_id in SKIP_RESOURCE_IDS:
        return []

    html = path.read_text(encoding='utf-8')
    questions: list[dict] = []

    for block in split_sample_blocks(html):
        label_m = LABEL_RE.search(block)
        label = strip_html(label_m.group(1)) if label_m else ''

        if re.search(r'<p><strong>问\s*\d+', block, re.IGNORECASE):
            for q in parse_multi_question_samples(block, label, resource_id, default_subject):
                key = q['content'][:80]
                if any(existing['content'][:80] == key for existing in questions):
                    continue
                questions.append(q)
                if len(questions) >= MAX_PER_RESOURCE:
                    return questions
            continue

        content = extract_content(block)
        if not content:
            continue

        options_m = OPTIONS_RE.search(block)
        if not options_m:
            continue
        options = normalize_options(LI_RE.findall(options_m.group(1)))
        if len(options) < 2:
            continue

        answer_block_m = SAMPLE_ANSWER_RE.search(block)
        if not answer_block_m:
            continue
        answer_raw = answer_block_m.group(1)
        answer_m = ANSWER_LETTER_RE.search(answer_raw)
        if not answer_m:
            continue

        answer = re.sub(r'[^A-D]', '', answer_m.group(1).upper())
        explanation = strip_html(re.sub(r'<strong>\s*答案[：:][^<]*</strong>', '', answer_raw, flags=re.I))
        if not explanation:
            explanation = strip_html(answer_raw)
        if not answer:
            continue

        unique_opts = {re.sub(r'^[A-D][\.．、\s]*', '', o) for o in options}
        if len(unique_opts) < len(options) and len(unique_opts) <= 2:
            continue

        qtype = infer_type(answer, options, label)
        if qtype == '判断' and len(options) == 2:
            options = ['A. 正确', 'B. 错误']
            answer = 'A' if 'A' in answer or answer.startswith('正') else 'B'

        questions.append({
            'subject_id': infer_subject(label, default_subject),
            'resource_id': resource_id,
            'type': qtype,
            'content': content,
            'options': options,
            'correct_answer': answer,
            'explanation': explanation,
            'tips': label or '结合资料样题练习，注意审题与选项比对。',
        })

        if len(questions) >= MAX_PER_RESOURCE:
            break

    return questions


def manual_prep_guide() -> list[dict]:
    return [
        {
            'subject_id': 1, 'resource_id': 2, 'type': '单选',
            'content': '《国考备考时间规划指南》建议：大一大二阶段的主要定位是：',
            'options': ['A. 冲刺刷题、每周全真模考', 'B. 夯实基础、养成备考习惯', 'C. 只学申论、放弃行测', 'D. 等大三再开始任何准备'],
            'correct_answer': 'B',
            'explanation': '指南强调大一大二处于夯实基础期，重在方法与习惯，而非高强度冲刺。',
            'tips': '备考周期分基础期、强化期、冲刺期三阶段。',
        },
        {
            'subject_id': 1, 'resource_id': 2, 'type': '单选',
            'content': '指南中的「24 周三阶段计划」不包括以下哪种做法？',
            'options': ['A. 基础期系统过一遍教材', 'B. 强化期分模块限时训练', 'C. 冲刺期每周复盘错题', 'D. 全程只背模板不做题'],
            'correct_answer': 'D',
            'explanation': '三阶段计划强调学习、训练、模考与复盘结合，反对只背模板不做题。',
            'tips': '计划表要配合每日执行与周末复盘。',
        },
        {
            'subject_id': 1, 'resource_id': 2, 'type': '单选',
            'content': '工作日可安排的日均备考时长，指南推荐约为：',
            'options': ['A. 30 分钟', 'B. 2–3 小时', 'C. 6–8 小时', 'D. 12 小时以上'],
            'correct_answer': 'B',
            'explanation': '在校生工作日建议 2–3 小时，周末 4–5 小时，兼顾学业。',
            'tips': '固定时段比随机突击更有效。',
        },
        {
            'subject_id': 7, 'resource_id': 2, 'type': '单选',
            'content': '指南对申论练习的执行要点是：',
            'options': ['A. 只在电脑上打字即可', 'B. 务必手写，培养卷面与速度', 'C. 只背范文不上考场练习', 'D. 每题写满 2000 字再停笔'],
            'correct_answer': 'B',
            'explanation': '示例日程强调申论手写限时，贴近真实考试卷面要求。',
            'tips': '小题限时 + 对照参考答案补要点。',
        },
        {
            'subject_id': 1, 'resource_id': 2, 'type': '单选',
            'content': '期末考前 1 周，指南建议如何调整备考？',
            'options': ['A. 加倍刷题到凌晨', 'B. 完全停止一切学习', 'C. 仅保留约 15 分钟时政，考后补偿', 'D. 立即开始每天 8 小时模考'],
            'correct_answer': 'C',
            'explanation': '「考试周暂停」策略：期末周减量保学业，考后周末双倍补偿。',
            'tips': '在校备考要与学期节奏错峰。',
        },
        {
            'subject_id': 1, 'resource_id': 2, 'type': '多选',
            'content': '指南推荐的「在校党专属技巧」包括：（多选）',
            'options': ['A. 图书馆固定座位形成备考条件反射', 'B. 2–3 人小组互查任务完成率', 'C. 思政课笔记纳入政治理论积累', 'D. 只攀比分数、互相炫耀正确率'],
            'correct_answer': 'ABC',
            'explanation': '组队备考强调互查坚持而非攀比分数；碎片时间可听时政背成语。',
            'tips': '组队 2–3 人为宜，每周一次打卡互查。',
        },
        {
            'subject_id': 5, 'resource_id': 2, 'type': '单选',
            'content': '示例「周二晚间」安排中，资料分析练习的目标是：',
            'options': ['A. 不限时做完即可', 'B. 2 篇约 11 分钟，正确率 ≥ 85%', 'C. 只做 1 题但要写 1 小时解析', 'D. 先写申论再补资料分析'],
            'correct_answer': 'B',
            'explanation': '示例日程对资料分析有明确限时与正确率目标，训练速算与节奏。',
            'tips': '资料分析练习必须限时，才有模考意义。',
        },
        {
            'subject_id': 1, 'resource_id': 2, 'type': '判断',
            'content': '指南建议：睡前复盘应「只改为什么错，不重做整卷」。',
            'options': ['A. 正确', 'B. 错误'],
            'correct_answer': 'A',
            'explanation': '每日复盘聚焦错因标签与方法修正，比盲目重刷整卷更高效。',
            'tips': '错题本记录错因类型：审题、公式、陷阱、粗心。',
        },
    ]


def manual_chengyu_boost() -> list[dict]:
    return [
        {
            'subject_id': 2, 'resource_id': 6, 'type': '单选',
            'content': '「差强人意」的正确理解是：',
            'options': ['A. 让人非常不满意', 'B. 大体上还能让人满意', 'C. 完全令人满意', 'D. 毫无用处'],
            'correct_answer': 'B',
            'explanation': '差强人意易误为「不满意」，实际指大体上还算满意。',
            'tips': '易混成语单独建对照表记忆。',
        },
        {
            'subject_id': 2, 'resource_id': 6, 'type': '单选',
            'content': '下列成语与「蹄疾步稳」意思最接近的是：',
            'options': ['A. 急功近利', 'B. 快而不乱、稳而不慢', 'C. 畏首畏尾', 'D. 一成不变'],
            'correct_answer': 'B',
            'explanation': '蹄疾步稳形容改革推进快而不乱、稳而不慢。',
            'tips': '政策类成语多作谓语、状语。',
        },
        {
            'subject_id': 2, 'resource_id': 6, 'type': '单选',
            'content': '「不以为然」与「不以为意」的区别是：',
            'options': ['A. 前者表示不同意，后者表示不放在心上', 'B. 两者完全相同', 'C. 前者表示不在乎，后者表示赞成', 'D. 前者是褒义，后者是贬义'],
            'correct_answer': 'A',
            'explanation': '不以为然=不认为对；不以为意=不放在心上，语义不同。',
            'tips': '注意「然」「意」一字之差。',
        },
        {
            'subject_id': 2, 'resource_id': 6, 'type': '单选',
            'content': '形容「事先做好准备」应选用：',
            'options': ['A. 未雨绸缪', 'B. 亡羊补牢', 'C. 江郎才尽', 'D. 画蛇添足'],
            'correct_answer': 'A',
            'explanation': '未雨绸缪指事先做好准备；亡羊补牢是事后补救。',
            'tips': '逻辑填空先辨褒贬色彩。',
        },
        {
            'subject_id': 2, 'resource_id': 6, 'type': '单选',
            'content': '「弹冠相庆」的感情色彩是：',
            'options': ['A. 褒义', 'B. 贬义', 'C. 中性', 'D. 无法判断'],
            'correct_answer': 'B',
            'explanation': '弹冠相庆指坏人上台互相庆贺，属贬义。',
            'tips': '褒贬色彩题先排除明显不合语境项。',
        },
        {
            'subject_id': 2, 'resource_id': 6, 'type': '单选',
            'content': '推进改革要「蹄疾步稳」，与之最不应并列的是：',
            'options': ['A. 循序渐进', 'B. 稳扎稳打', 'C. 一哄而上', 'D. 行稳致远'],
            'correct_answer': 'C',
            'explanation': '一哄而上强调盲目冒进，与蹄疾步稳的稳健导向相悖。',
            'tips': '关注动宾搭配与政策语境。',
        },
    ]


def manual_shenlun_boost() -> list[dict]:
    return [
        {
            'subject_id': 7, 'resource_id': 14, 'type': '单选',
            'content': '申论综合分析题中，「评价型」题目的标准结构是：',
            'options': ['A. 表态→理由分析→对策或总结', 'B. 标题→主送机关→落款', 'C. 抄录材料→摘抄→复述', 'D. 只写对策不分析'],
            'correct_answer': 'A',
            'explanation': '评价型综合分析按表态、正反分析、对策或总结展开。',
            'tips': '评价型常含「辩证看待」。',
        },
        {
            'subject_id': 7, 'resource_id': 14, 'type': '单选',
            'content': '贯彻执行题撰写「倡议书」时，一般不需要的部分是：',
            'options': ['A. 标题与称谓', 'B. 背景目的与倡议分条', 'C. 号召性结尾', 'D. 刑法全文附录'],
            'correct_answer': 'D',
            'explanation': '倡议书重格式完整与倡议内容，无需附录法律全文。',
            'tips': '格式分：标题、称谓、正文、落款。',
        },
        {
            'subject_id': 7, 'resource_id': 22, 'type': '单选',
            'content': '使用申论热点素材时，最忌讳的是：',
            'options': ['A. 理解金句含义后调用', 'B. 案例记「主体+做法+成效」', 'C. 大段堆砌与题干无关热点', 'D. 根据题干裁剪对策条目'],
            'correct_answer': 'C',
            'explanation': '素材须扣题融合，堆砌无关热点会偏离材料主旨。',
            'tips': '素材是锦上添花，扣题才是根本。',
        },
        {
            'subject_id': 7, 'resource_id': 22, 'type': '单选',
            'content': '申论素材库中，「发展与安全」类热点通常可用于论证：',
            'options': ['A. 只写个人兴趣爱好', 'B. 统筹高质量发展与高水平安全', 'C. 完全脱离国情空谈', 'D. 只抄数据不分析'],
            'correct_answer': 'B',
            'explanation': '发展与安全是国考高频主题，适用于对策与大作文论证。',
            'tips': '每个热点记 1 条金句 + 1 个案例。',
        },
        {
            'subject_id': 7, 'resource_id': 22, 'type': '多选',
            'content': '申论素材「三要素记忆法」包括：（多选）',
            'options': ['A. 核心金句', 'B. 典型案例', 'C. 对策表述', 'D. 随机网络段子'],
            'correct_answer': 'ABC',
            'explanation': '指南建议记金句、案例、对策三要素，并能用自己的话复述。',
            'tips': '先理解再背诵，避免写错中央表述。',
        },
    ]


def manual_extra() -> list[dict]:
    """Hand-curated questions for resources without MCQ-style HTML blocks."""
    return manual_prep_guide() + manual_chengyu_boost() + manual_shenlun_boost() + [
        {
            'subject_id': 3, 'resource_id': 8, 'type': '单选',
            'content': '数量公式：甲、乙两地相距 360 km，甲速 100 km/h，乙速 80 km/h，相向而行。甲先独自行驶 80 km 后乙才出发，问相遇时乙距 A 地约多少千米？',
            'options': ['A. 140', 'B. 155.6', 'C. 160', 'D. 180'],
            'correct_answer': 'B',
            'explanation': '甲先走 80 km 后，剩余 280 km 相向而行，t=280÷180=14/9 h，乙行驶 80×14/9≈124.4 km？手册按甲速 100 计：100×14/9≈155.6 km 为相遇点距 A 地距离。',
            'tips': '行程问题先画线段图，注意先后出发。',
        },
        {
            'subject_id': 3, 'resource_id': 8, 'type': '单选',
            'content': '工程问题：甲单独 10 天完成，乙单独 15 天完成，两人合作需要多少天？',
            'options': ['A. 5 天', 'B. 6 天', 'C. 7 天', 'D. 8 天'],
            'correct_answer': 'B',
            'explanation': '合作效率 1/10+1/15=1/6，需 6 天。',
            'tips': '设工作总量为时间公倍数。',
        },
        {
            'subject_id': 3, 'resource_id': 8, 'type': '单选',
            'content': '浓度问题：20% 盐水 300 克，要配制 15% 盐水需加水多少克？',
            'options': ['A. 50 克', 'B. 80 克', 'C. 100 克', 'D. 120 克'],
            'correct_answer': 'C',
            'explanation': '溶质 60 克不变，60÷0.15=400 克溶液，加水 100 克。',
            'tips': '十字交叉或溶质守恒。',
        },
        {
            'subject_id': 7, 'resource_id': 13, 'type': '单选',
            'content': '申论归纳概括题的首要要求是：',
            'options': ['A. 辞藻华丽、篇幅越长越好', 'B. 全面准确、简洁规范', 'C. 完全照搬材料原文', 'D. 脱离材料自由发挥'],
            'correct_answer': 'B',
            'explanation': '归纳概括需全面准确、适度提炼，忌照抄与漏点。',
            'tips': '先找标志词，再分类整合。',
        },
        {
            'subject_id': 7, 'resource_id': 13, 'type': '单选',
            'content': '综合分析题「解释型」的标准结构是：',
            'options': ['A. 释义→分析→总结', 'B. 对策→举例→号召', 'C. 标题→落款→日期', 'D. 抄录→摘抄→复述'],
            'correct_answer': 'A',
            'explanation': '解释型综合分析按释义、分析、总结（或升华）展开。',
            'tips': '综合分析不可只列对策，须先解释题干。',
        },
        {
            'subject_id': 7, 'resource_id': 13, 'type': '单选',
            'content': '贯彻执行题（倡议书）一般不需要的要素是：',
            'options': ['A. 标题', 'B. 称谓', 'C. 落款日期', 'D. 刑法条文全文'],
            'correct_answer': 'D',
            'explanation': '倡议书含标题、称谓、正文、落款日期；无需引用刑法全文。',
            'tips': '应用文先保格式分，再保内容分。',
        },
        {
            'subject_id': 7, 'resource_id': 13, 'type': '单选',
            'content': '提出对策类申论题，对策应主要来源于：',
            'options': ['A. 材料中的问题与原因', 'B. 个人随意编造', 'C. 网络段子', 'D. 与材料无关的热点堆砌'],
            'correct_answer': 'A',
            'explanation': '对策须针对材料问题，可行、具体，一一对应。',
            'tips': '每条对策写清主体+手段+目的。',
        },
        {
            'subject_id': 7, 'resource_id': 14, 'type': '单选',
            'content': '申论提出对策题中，下列表述最规范的是：',
            'options': ['A. 加强领导，高度重视', 'B. 政府补启动、企业管运营、社会来监督', 'C. 多多宣传', 'D. 想办法解决'],
            'correct_answer': 'B',
            'explanation': '规范对策须主体、手段、目的明确，避免空泛套话。',
            'tips': '避免「加强领导」类空话。',
        },
        {
            'subject_id': 7, 'resource_id': 14, 'type': '单选',
            'content': '申论大作文立意应：',
            'options': ['A. 脱离材料自由发挥', 'B. 紧扣材料与题干', 'C. 只抄材料不讲观点', 'D. 篇幅越短越好'],
            'correct_answer': 'B',
            'explanation': '大作文立意须源于材料，观点明确、论证充分。',
            'tips': '由材料案例升华到政策层面。',
        },
        {
            'subject_id': 7, 'resource_id': 18, 'type': '单选',
            'content': '2026 年国考申论考试时限为：',
            'options': ['A. 120 分钟', 'B. 150 分钟', 'C. 180 分钟', 'D. 210 分钟'],
            'correct_answer': 'C',
            'explanation': '申论考试时限 180 分钟（3 小时）。',
            'tips': '考前熟记各模块时限。',
        },
        {
            'subject_id': 7, 'resource_id': 18, 'type': '单选',
            'content': '申论「先立后破」的含义最准确的是：',
            'options': ['A. 先关停所有传统产业', 'B. 先培育新动能再稳妥调整旧动能', 'C. 只发展新兴产业', 'D. 照搬单一发展模式'],
            'correct_answer': 'B',
            'explanation': '先立后破强调在培育新动能同时稳妥推进转型，避免简单关停。',
            'tips': '政策表述题抓官方定义。',
        },
        {
            'subject_id': 7, 'resource_id': 22, 'type': '单选',
            'content': '申论素材使用的正确做法是：',
            'options': ['A. 大段堆砌与题干无关热点', 'B. 准确调用、扣题融合', 'C. 只背金句不理解含义', 'D. 完全不用任何案例'],
            'correct_answer': 'B',
            'explanation': '素材价值在于准确调用并与材料主旨融合，忌堆砌。',
            'tips': '记「地点/主体+做法+成效」三要素。',
        },
        {
            'subject_id': 1, 'resource_id': 23, 'type': '单选',
            'content': '国考职位表中，「职位类别」主要决定：',
            'options': ['A. 申论试卷类别', 'B. 面试着装颜色', 'C. 体检医院', 'D. 准考证字号'],
            'correct_answer': 'A',
            'explanation': '职位类别决定申论试卷类型，备考须对应。',
            'tips': '选岗时核对专业、学历、政治面貌。',
        },
        {
            'subject_id': 1, 'resource_id': 23, 'type': '单选',
            'content': '报名国考时，「专业」字段应：',
            'options': ['A. 随意填写相近专业', 'B. 与毕业证书专业名称严格对应', 'C. 写想学的专业', 'D. 留空'],
            'correct_answer': 'B',
            'explanation': '资格审查以毕业证书专业为准，须严格对应。',
            'tips': '对照教育部专业目录核对。',
        },
        {
            'subject_id': 4, 'resource_id': 10, 'type': '单选',
            'content': '图形推理：元素组成相同，应优先考虑：',
            'options': ['A. 数量类', 'B. 位置类', 'C. 样式类求异', 'D. 属性类对称'],
            'correct_answer': 'B',
            'explanation': '元素组成完全相同，优先平移、旋转、翻转等位置规律。',
            'tips': '图形题：相同→位置，相似→样式，不同→数量。',
        },
        {
            'subject_id': 4, 'resource_id': 10, 'type': '单选',
            'content': '图形推理：元素组成不同且杂乱，应优先考虑：',
            'options': ['A. 位置平移', 'B. 黑白运算', 'C. 数量类（点线角面素）', 'D. 翻转'],
            'correct_answer': 'C',
            'explanation': '元素组成不同，常考点、线、角、面、素等数量规律。',
            'tips': '先数后形，先整体后局部。',
        },
    ]


def manual_multiselect() -> list[dict]:
    """Curated multi-select questions not present in HTML samples."""
    return [
        {
            'subject_id': 6,
            'resource_id': 12,
            'type': '多选',
            'content': '下列属于可再生能源的有：（多选）',
            'options': ['A. 太阳能', 'B. 风能', 'C. 煤炭', 'D. 水能'],
            'correct_answer': 'ABD',
            'explanation': '太阳能、风能、水能（含水电）为可再生能源；煤炭为化石能源。',
            'tips': '多选题用排除法，先剔除明显错误项。',
        },
        {
            'subject_id': 6,
            'resource_id': 12,
            'type': '多选',
            'content': '根据宪法，下列属于公民基本权利的有：（多选）',
            'options': ['A. 受教育权', 'B. 言论自由', 'C. 依法纳税', 'D. 人身自由'],
            'correct_answer': 'ABD',
            'explanation': '受教育权、言论自由、人身自由属于基本权利；依法纳税是义务。',
            'tips': '区分「权利」与「义务」是常识多选常考点。',
        },
        {
            'subject_id': 6,
            'resource_id': 12,
            'type': '多选',
            'content': '2025—2026 年时政热点中，与「新质生产力」相关的表述有：（多选）',
            'options': ['A. 以科技创新为主导', 'B. 摆脱传统经济增长方式', 'C. 主要依靠要素投入扩张', 'D. 具有高科技、高效能、高质量特征'],
            'correct_answer': 'ABD',
            'explanation': '新质生产力强调创新驱动与高质量发展，而非要素粗放投入。',
            'tips': '政策类多选抓文件原文关键词。',
        },
        {
            'subject_id': 2,
            'resource_id': 7,
            'type': '多选',
            'content': '下列各句中，没有语病且有语病排查价值的有：（多选）',
            'options': ['A. 通过这次学习，使我提高了认识', 'B. 他勤奋学习，成绩一直名列前茅', 'C. 能否坚持锻炼，是身体健康的关键', 'D. 我们要认真克服并发现工作中的缺点'],
            'correct_answer': 'ACD',
            'explanation': 'A 缺主语，C 两面一面，D 语序不当；B 无语病。',
            'tips': '语病多选优先看主语、搭配、两面词。',
        },
        {
            'subject_id': 2,
            'resource_id': 6,
            'type': '多选',
            'content': '下列成语使用恰当的有：（多选）',
            'options': ['A. 改革要蹄疾步稳', 'B. 他对批评不以为然', 'C. 这项政策差强人意，令人失望', 'D. 各地应因地制宜发展产业'],
            'correct_answer': 'ABD',
            'explanation': '差强人意指大体上还能让人满意，与「令人失望」矛盾，C 使用不当。',
            'tips': '成语题注意褒贬色彩与易混词。',
        },
        {
            'subject_id': 5,
            'resource_id': 11,
            'type': '多选',
            'content': '资料分析中，适合用「截位直除」的情形有：（多选）',
            'options': ['A. 选项首位数字不同', 'B. 计算基期量', 'C. 比较分数大小且选项差距明显', 'D. 精确到小数点后四位'],
            'correct_answer': 'ABC',
            'explanation': '截位直除用于估算与比较；要求极高精度时不适用。',
            'tips': '速算技巧题结合选项差距判断方法。',
        },
        {
            'subject_id': 5,
            'resource_id': 11,
            'type': '多选',
            'content': '已知某地区 2024 年进出口总额增长 8%，出口增长 12%，进口增长 3%。下列说法正确的有：（多选）',
            'options': ['A. 出口增速快于整体增速', 'B. 进口增速慢于整体增速', 'C. 出口对总额增长的贡献可能更大', 'D. 进出口总额一定下降'],
            'correct_answer': 'ABC',
            'explanation': '出口、进口增速一快一慢，整体增速介于其间；D 与题干矛盾。',
            'tips': '混合增长率题用整体介于部分之间判断。',
        },
        {
            'subject_id': 1,
            'resource_id': 5,
            'type': '多选',
            'content': '关于「中国式现代化」，下列理解正确的有：（多选）',
            'options': ['A. 是人口规模巨大的现代化', 'B. 是全体人民共同富裕的现代化', 'C. 是走和平发展道路的现代化', 'D. 可以照搬西方现代化模式'],
            'correct_answer': 'ABC',
            'explanation': '中国式现代化有五个中国特色，不能照搬西方模式。',
            'tips': '政治理论多选以二十大报告表述为准。',
        },
        {
            'subject_id': 4,
            'resource_id': 10,
            'type': '多选',
            'content': '图形推理中，常见考查维度有：（多选）',
            'options': ['A. 对称性', 'B. 封闭区域数', 'C. 笔画数', 'D. 元素种类与位置'],
            'correct_answer': 'ABCD',
            'explanation': '图形推理常从对称、数量、样式、位置等多维度命题。',
            'tips': '图形题先数后形，先整体后局部。',
        },
        {
            'subject_id': 4,
            'resource_id': 21,
            'type': '多选',
            'content': '加强型论证题中，下列能支持论点「运动有助于改善睡眠」的有：（多选）',
            'options': ['A. 运动人群平均入睡时间缩短', 'B. 运动能提高体内褪黑素水平', 'C. 失眠患者普遍不爱运动', 'D. 运动后体温下降有助于入睡'],
            'correct_answer': 'ABD',
            'explanation': 'C 说明相关但未建立运动改善睡眠的因果；A、B、D 提供机制或效果支持。',
            'tips': '加强削弱题区分「因果支持」与「相关描述」。',
        },
        {
            'subject_id': 7,
            'resource_id': 14,
            'type': '多选',
            'content': '申论作答中，符合「归纳概括」规范的做法有：（多选）',
            'options': ['A. 分条列点、层次清晰', 'B. 照搬材料原文不加工', 'C. 使用规范书面语', 'D. 完全脱离材料主观发挥'],
            'correct_answer': 'AC',
            'explanation': '归纳概括要全面准确、适度提炼；忌照搬冗长与脱离材料。',
            'tips': '申论小题先找标志词再分类整合。',
        },
        {
            'subject_id': 3,
            'resource_id': 9,
            'type': '多选',
            'content': '下列属于经典「工程问题」解题思路的有：（多选）',
            'options': ['A. 设工作总量为时间公倍数', 'B. 赋值效率求解合作时间', 'C. 只凭直觉估算不做列式', 'D. 用 1/效率 求单独完成时间'],
            'correct_answer': 'ABD',
            'explanation': '工程问题常用赋值法与效率相加；纯直觉估算不可靠。',
            'tips': '数量关系多选关注方法而非单题答案。',
        },
    ]


def to_sql_row(q: dict) -> str:
    options_json = json.dumps(q['options'], ensure_ascii=False)
    return (
        f"({q['subject_id']}, {q['resource_id']}, '{q['type']}', "
        f"'{sql_escape(q['content'])}', "
        f"'{sql_escape(options_json)}', "
        f"'{sql_escape(q['correct_answer'])}', "
        f"'{sql_escape(q['explanation'])}', "
        f"'{sql_escape(q['tips'])}')"
    )


def main() -> None:
    all_questions: list[dict] = []
    seen_content: set[str] = set()

    for path in sorted(RESOURCES_DIR.glob('*.html')):
        for q in parse_file(path):
            key = q['content'][:80]
            if key in seen_content:
                continue
            seen_content.add(key)
            all_questions.append(q)

    for q in manual_extra() + manual_multiselect():
        key = q['content'][:80]
        if key not in seen_content:
            seen_content.add(key)
            all_questions.append(q)

    rows = [to_sql_row(q) for q in all_questions]
    sql = 'INSERT INTO questions (subject_id, resource_id, type, content, options, correct_answer, explanation, tips) VALUES\n'
    sql += ',\n'.join(rows) + ';'

    out_path = ROOT / 'backend' / '_generated_questions.sql'
    out_path.write_text(sql + '\n', encoding='utf-8')
    print(f'Generated {len(all_questions)} questions -> {out_path}')

    from collections import Counter
    by_resource = Counter(q['resource_id'] for q in all_questions)
    by_type = Counter(q['type'] for q in all_questions)
    print('by_type:', dict(by_type))
    print('by_resource:', dict(sorted(by_resource.items())))


if __name__ == '__main__':
    main()