from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SQL_PATH = ROOT / 'db' / 'seed' / 'init_db.sql'
GEN_PATH = ROOT / 'backend' / '_generated_questions.sql'

text = SQL_PATH.read_text(encoding='utf-8')
generated = GEN_PATH.read_text(encoding='utf-8').strip()

old_tail = (
    "(NULL, '国考报名资格审查与调剂公告', '公告', "
    "'审查材料清单、调剂条件与流程、选岗策略及常见问题解答。', "
    "'assets/resources/17-gk-tiaoji.html');"
)
new_tail = """(NULL, '国考报名资格审查与调剂公告', '公告', '审查材料清单、调剂条件与流程、选岗策略及常见问题解答。', 'assets/resources/17-gk-tiaoji.html'),
(7, '2026 年国考申论大纲专项解读', '资料', '三类职位试卷对比、作答规范细则、常见失分点清单 + 2 道代表性样题。', 'assets/resources/18-gk-2026-shenlun-outline.html'),
(1, '2023 年国考行测真题回顾', '真题', '2023—2025 三年对比分析、命题趋势研判、12 道代表性真题精讲。', 'assets/resources/19-gk-2023-xingce.html'),
(1, '行测考前冲刺模拟卷（二）', '模拟题', '130 题全真结构、20 道精选模拟题含解析、分模块限时策略。', 'assets/resources/20-mock-xingce-2.html'),
(4, '逻辑判断 50 题专项训练', '模拟题', '翻译推理、加强削弱、前提假设等六大题型 + 25 道精选样题。', 'assets/resources/21-luoji-panduan-50.html'),
(7, '2026 申论热点素材库', '资料', '15 个国考高频热点，含核心金句、典型案例、对策表述三要素。', 'assets/resources/22-shenlun-sucai-2026.html'),
(NULL, '国考职位表使用指南', '资料', '职位表字段解读、五步筛选法、专业目录对照 + 6 个报岗案例分析。', 'assets/resources/23-gk-position-guide.html');"""

if old_tail in text:
    text = text.replace(old_tail, new_tail)
elif '18-gk-2026-shenlun-outline.html' not in text:
    raise SystemExit('Could not find resources section to patch in init_db.sql')

q_start = text.index('INSERT INTO questions')
q_end = text.index('INSERT INTO goals')
text = text[:q_start] + generated + '\n\n' + text[q_end:]

SQL_PATH.write_text(text, encoding='utf-8')
print(f'Patched {SQL_PATH}')