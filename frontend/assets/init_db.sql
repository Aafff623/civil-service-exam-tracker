-- =============================================================================
-- 公务员考试学习跟踪系统 — MySQL 初始化脚本
-- 引擎: MySQL 8.0+ | 字符集: utf8mb4
-- 用法: mysql -u root -p < init_db.sql  或  backend 目录执行 python init_db.py
-- =============================================================================
--
-- 前端模块与数据表对应关系:
-- | 模块       | 主要数据表                                      |
-- |------------|------------------------------------------------|
-- | 登录/注册  | users                                          |
-- | 首页仪表盘 | goals, plans, plan_items, progress, weak_points|
-- | 学习计划   | goals, plans, plan_items, subjects             |
-- | 资源库     | resources, subjects                            |
-- | 题库练习   | questions, answers, comments                   |
-- | 学习统计   | progress, answers, plan_items, weak_points     |
-- | 学习推荐   | weak_points, answers, goals, plans, resources  |
--
-- 演示账号 (密码均为 werkzeug scrypt 哈希):
-- | 用户名      | 密码       | 角色   | 说明                         |
-- |-------------|------------|--------|------------------------------|
-- | root        | 123456     | admin  | 超级管理员，完整演示数据     |
-- | testuser1   | 123456     | user   | 有部分学习计划与答题记录     |
-- | testuser2   | 123456     | user   | 空数据，测试新用户空状态     |
-- | testuser3   | 123456     | user   | 仅有少量答题，测试弱项推荐   |
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS weak_points;
DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS plan_items;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS subjects;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT,
    weight DOUBLE NOT NULL DEFAULT 1.0,
    difficulty DOUBLE NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES subjects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(16) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (role IN ('admin', 'user'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_type VARCHAR(32) NOT NULL DEFAULT '国考',
    start_date DATE NOT NULL,
    exam_date DATE NOT NULL,
    daily_minutes INT NOT NULL DEFAULT 120,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(16) NOT NULL,
    content TEXT,
    url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CHECK (type IN ('大纲', '真题', '模拟题', '资料', '公告'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    type VARCHAR(16) NOT NULL,
    content TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_answer VARCHAR(16) NOT NULL,
    explanation TEXT,
    tips TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CHECK (type IN ('单选', '多选', '判断'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer VARCHAR(16) NOT NULL,
    is_correct TINYINT(1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CHECK (is_correct IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (status IN ('active', 'paused', 'completed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    subject_id INT NOT NULL,
    item_date DATE NOT NULL,
    content VARCHAR(512) NOT NULL,
    suggested_minutes INT NOT NULL DEFAULT 30,
    is_completed TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CHECK (is_completed IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    record_date DATE NOT NULL,
    study_minutes INT NOT NULL DEFAULT 0,
    completed_items INT NOT NULL DEFAULT 0,
    answer_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_progress_user_date (user_id, record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE weak_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    accuracy DOUBLE NOT NULL DEFAULT 0,
    total_answers INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE KEY uq_weak_user_subject (user_id, subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(16) NOT NULL,
    target_id INT NOT NULL,
    reason TEXT,
    is_viewed TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (type IN ('resource', 'question')),
    CHECK (is_viewed IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    user_id INT NOT NULL,
    content VARCHAR(500) NOT NULL,
    reply_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to) REFERENCES comments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_resources_subject_id ON resources(subject_id);
CREATE INDEX idx_questions_subject_id ON questions(subject_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_plan_items_plan_id ON plan_items(plan_id);
CREATE INDEX idx_plan_items_date ON plan_items(item_date);
CREATE INDEX idx_progress_user_date ON progress(user_id, record_date);
CREATE INDEX idx_weak_points_user_id ON weak_points(user_id);
CREATE INDEX idx_comments_question_id ON comments(question_id);

INSERT INTO subjects (id, name, parent_id, weight, difficulty) VALUES
(1, '行政职业能力测验', NULL, 1.2, 1.0),
(2, '言语理解与表达', 1, 1.0, 0.8),
(3, '数量关系', 1, 1.0, 1.3),
(4, '判断推理', 1, 1.1, 1.1),
(5, '资料分析', 1, 1.1, 1.0),
(6, '常识判断', 1, 0.9, 0.9),
(7, '申论', NULL, 1.3, 1.2);

INSERT INTO users (id, username, password_hash, role) VALUES
(1, 'root', 'scrypt:32768:8:1$YAzrRJBtEoioArgx$56d0f0558f41d52a5a73792f5e55933e848c0fdd3b69807dda6bf6085eff9bbb4b5b7132027dfcde92daa29b169c532badc520b772a48e92c74b24f4afc0c347', 'admin'),
(2, 'testuser1', 'scrypt:32768:8:1$YAzrRJBtEoioArgx$56d0f0558f41d52a5a73792f5e55933e848c0fdd3b69807dda6bf6085eff9bbb4b5b7132027dfcde92daa29b169c532badc520b772a48e92c74b24f4afc0c347', 'user'),
(3, 'testuser2', 'scrypt:32768:8:1$YAzrRJBtEoioArgx$56d0f0558f41d52a5a73792f5e55933e848c0fdd3b69807dda6bf6085eff9bbb4b5b7132027dfcde92daa29b169c532badc520b772a48e92c74b24f4afc0c347', 'user'),
(4, 'testuser3', 'scrypt:32768:8:1$YAzrRJBtEoioArgx$56d0f0558f41d52a5a73792f5e55933e848c0fdd3b69807dda6bf6085eff9bbb4b5b7132027dfcde92daa29b169c532badc520b772a48e92c74b24f4afc0c347', 'user');

INSERT INTO resources (subject_id, title, type, content, url) VALUES
(NULL, '2026 年国家公务员考试大纲', '大纲', '完整大纲解读：考试说明、行测六大模块考查要点与例题、申论三类职位能力、专业科目概览及备考建议（10 章）。', 'assets/resources/01-gk-2026-outline.html'),
(NULL, '国考备考时间规划指南', '资料', '大一大二备考定位 + 24 周三阶段计划表 + 每日时间分配 + 模考复盘与常见误区（6 章）。', 'assets/resources/02-prep-plan-guide.html'),
(1, '2025 年国考行测真题（完整版）', '真题', '试卷结构、模块题量分值、六大模块代表性真题样题与解析、模考建议与答案汇总。', 'assets/resources/03-gk-2025-xingce.html'),
(1, '2024 年国考行测真题', '真题', '与 2025 卷对比分析、题型趋势、5 道代表性真题与双卷联练方案。', 'assets/resources/04-gk-2024-xingce.html'),
(1, '行测考前冲刺模拟卷（一）', '模拟题', '130 题全真结构说明、10 道精选模拟题含解析、分模块涂卡与时间策略。', 'assets/resources/05-mock-xingce-1.html'),
(2, '言语理解高频成语 500 个', '资料', '40+ 高频成语分组、20 组易混辨析总表、逻辑填空记忆法与练习建议。', 'assets/resources/06-yanyu-chengyu.html'),
(2, '言语理解片段阅读技巧', '资料', '主旨概括、细节判断、词句理解、标题注入四大题型框架与例题精讲。', 'assets/resources/07-yanyu-pianduan.html'),
(3, '数量关系公式手册', '资料', '行程、工程、利润、排列组合、概率、容斥原理分章公式与典型例题。', 'assets/resources/08-shuliang-formulas.html'),
(3, '数量关系 100 道经典题', '模拟题', '入门/进阶/冲刺三档说明、15 道精选题含解析与训练计划。', 'assets/resources/09-shuliang-100.html'),
(4, '判断推理图形规律总结', '资料', '位置、样式、数量、对称、笔画、封闭区域六大类规律与例题。', 'assets/resources/10-tuili-tuxing.html'),
(5, '资料分析速算技巧', '资料', '核心公式、截位直除/特征数字/比较估算技巧 + 3 套材料样题。', 'assets/resources/11-ziliao-susuan.html'),
(6, '常识判断时政热点汇编', '资料', '政治经济法律科技文史分模块梳理 + 2025–2026 时政热点对照表。', 'assets/resources/12-changshi-shizheng.html'),
(7, '申论写作模板与范文', '资料', '归纳概括、综合分析、贯彻执行、提出对策、大作文五类模板与范文节选。', 'assets/resources/13-shenlun-template.html'),
(7, '2025 年国考申论真题', '真题', '给定材料概述、4 道小题样题 + 大作文题目、作答要点与参考范文。', 'assets/resources/14-gk-2025-shenlun.html'),
(NULL, '2026 年国家公务员考试招考公告', '公告', '报考条件详解、报名流程、职位表筛选、考试日程、体检考察与 FAQ（6 章）。', 'assets/resources/15-gk-2026-notice.html'),
(NULL, '2026 年各省公务员考试政策汇总', '公告', '联考省份表、单独命题省份、选调生事业单位、时间节点与国考省考区别。', 'assets/resources/16-provincial-policy.html'),
(NULL, '国考报名资格审查与调剂公告', '公告', '审查材料清单、调剂条件与流程、选岗策略及常见问题解答。', 'assets/resources/17-gk-tiaoji.html');

INSERT INTO questions (subject_id, type, content, options, correct_answer, explanation, tips) VALUES
(2, '单选', '下列词语中，没有错别字的一项是：', '["A. 甘拜下风", "B. 甘败下风", "C. 甘拜下风", "D. 甘败下风"]', 'A', '正确写法是“甘拜下风”。', '注意“拜”是拜服的意思。'),
(2, '单选', '依次填入横线最恰当的一组是：这场改革___了旧观念，___了发展新动能。', '["A. 打破 激发", "B. 打破 激活", "C. 打破 激发", "D. 打破 激活"]', 'A', '“激发新动能”为常见搭配。', '关注动宾搭配。'),
(2, '单选', '下列句子没有语病的一项是：', '["A. 通过这次学习，使我提高了认识", "B. 我们要认真克服并发现工作中的缺点", "C. 能否坚持锻炼，是身体健康的关键", "D. 他勤奋学习，成绩一直名列前茅"]', 'D', 'A 缺主语，B 语序不当，C 两面一面。', '语病题先找主干。'),
(3, '单选', '1, 3, 5, 7, ?', '["A. 8", "B. 9", "C. 10", "D. 11"]', 'B', '奇数序列，下一个是 9。', '观察数字规律。'),
(3, '单选', '甲、乙两人同时从 A 地出发前往 B 地，甲速度 60km/h，乙速度 40km/h，甲到达 B 地后立即返回，两人在途中第二次相遇时距 A 地多少千米？（AB 相距 200km）', '["A. 120", "B. 140", "C. 160", "D. 180"]', 'C', '行程问题画线段图，注意相遇次数。', '相遇问题优先画图。'),
(3, '单选', '某工程甲单独做 10 天完成，乙单独做 15 天完成，两人合作需要多少天？', '["A. 5", "B. 6", "C. 7", "D. 8"]', 'B', '合作效率 = 1/10 + 1/15 = 1/6，需 6 天。', '工程问题设工作总量为公倍数。'),
(4, '单选', '所有的鸟都会飞。企鹅是鸟。所以：', '["A. 企鹅会飞", "B. 企鹅不会飞", "C. 所有鸟都不会飞", "D. 无法判断"]', 'A', '按形式逻辑推导应选 A；常识上企鹅不会飞说明前提有误。', '逻辑题按形式，不掺常识。'),
(4, '单选', '从所给四个选项中，选择最合适的一个填入问号处，使之呈现一定规律性。', '["A. 对称轴数量递增", "B. 封闭区域数递增", "C. 线条数递减", "D. 元素种类递增"]', 'B', '图形推理常考封闭区域、对称、曲直等规律。', '先数元素，再找规律。'),
(4, '判断', '如果今天下雨，那么地面会湿。今天地面湿了，所以今天一定下雨了。', '["A. 正确", "B. 错误"]', 'B', '属于肯定后件谬误，地面湿不一定因为下雨。', '区分充分条件与必要条件。'),
(5, '单选', '2024 年某市 GDP 为 8000 亿元，同比增长 5%，则 2023 年 GDP 约为多少亿元？', '["A. 7400", "B. 7520", "C. 7619", "D. 7800"]', 'C', '8000 / 1.05 ≈ 7619 亿元。', '基期量 = 现期量 / (1 + r)。'),
(5, '单选', '某产品进口额占进出口总额的 40%，出口额比进口额多 20%，则出口额占进出口总额的比重为？', '["A. 44%", "B. 48%", "C. 52%", "D. 56%"]', 'B', '设总额 100，进口 40，出口 48，比重 48%。', '比重问题设特值简化。'),
(6, '单选', '下列属于可再生能源的是：', '["A. 煤炭", "B. 石油", "C. 太阳能", "D. 天然气"]', 'C', '太阳能、风能、水能等为可再生能源。', '常识题注意政策热点。'),
(6, '单选', '《宪法》规定，中华人民共和国的一切权力属于：', '["A. 公民", "B. 人民", "C. 全国人大", "D. 国务院"]', 'B', '宪法第二条：一切权力属于人民。', '法条题抓关键词。'),
(7, '单选', '申论文章的核心要求是：', '["A. 辞藻华丽", "B. 观点明确、论证充分", "C. 篇幅越长越好", "D. 多用修辞手法"]', 'B', '申论重在观点明确、论证充分、结构清晰。', '紧扣材料，结构清晰。'),
(7, '单选', '归纳概括题的首要原则是：', '["A. 主观发挥", "B. 照搬原文", "C. 全面准确、简洁规范", "D. 字数越多越好"]', 'C', '归纳概括需全面准确，适度概括，不能漏点。', '先找标志词，再分类整合。'),
(7, '单选', '提出对策类题目，对策应主要来源于：', '["A. 个人经验", "B. 材料中的问题与原因", "C. 网络评论", "D. 随意编造"]', 'B', '对策应针对材料问题，可行、具体。', '问题与对策一一对应。');

INSERT INTO goals (user_id, exam_type, start_date, exam_date, daily_minutes) VALUES
(1, '国考', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 180 DAY), 180),
(2, '国考', DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 120 DAY), 120);

INSERT INTO plans (user_id, start_date, end_date, status) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'active'),
(2, DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 120 DAY), 'active');

INSERT INTO plan_items (plan_id, subject_id, item_date, content, suggested_minutes, is_completed)
SELECT
    1,
    sub.subject_id,
    d.item_date,
    CONCAT('学习', sub.subject_name, '：', sub.task_type),
    sub.minutes,
    CASE
        WHEN d.item_date < CURDATE() THEN 1
        WHEN d.item_date = CURDATE() AND sub.subject_id IN (3, 5) THEN 1
        ELSE 0
    END
FROM (
    SELECT DATE_ADD(CURDATE(), INTERVAL offs DAY) AS item_date
    FROM (
        SELECT -13 AS offs UNION SELECT -12 UNION SELECT -11 UNION SELECT -10 UNION SELECT -9
        UNION SELECT -8 UNION SELECT -7 UNION SELECT -6 UNION SELECT -5 UNION SELECT -4
        UNION SELECT -3 UNION SELECT -2 UNION SELECT -1 UNION SELECT 0
        UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
        UNION SELECT 6 UNION SELECT 7
    ) offsets
) d
CROSS JOIN (
    SELECT 2 AS subject_id, '言语理解与表达' AS subject_name, '专项练习与知识巩固' AS task_type, 45 AS minutes UNION ALL
    SELECT 3, '数量关系', '限时训练', 45 UNION ALL
    SELECT 4, '判断推理', '错题回顾与归纳', 40 UNION ALL
    SELECT 5, '资料分析', '速算技巧演练', 40 UNION ALL
    SELECT 6, '常识判断', '时政热点梳理', 30 UNION ALL
    SELECT 7, '申论', '大作文提纲练习', 50
) sub;

INSERT INTO plan_items (plan_id, subject_id, item_date, content, suggested_minutes, is_completed) VALUES
(2, 2, CURDATE(), '学习言语理解与表达：基础巩固', 30, 0),
(2, 3, CURDATE(), '学习数量关系：公式记忆', 30, 0),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '学习判断推理：图形推理', 30, 1);

INSERT INTO answers (user_id, question_id, selected_answer, is_correct, created_at) VALUES
(1, 1, 'A', 1, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(1, 2, 'B', 0, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(1, 3, 'D', 1, DATE_SUB(NOW(), INTERVAL 11 DAY)),
(1, 4, 'B', 1, DATE_SUB(NOW(), INTERVAL 11 DAY)),
(1, 5, 'A', 0, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 6, 'B', 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 7, 'A', 1, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(1, 8, 'C', 0, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(1, 9, 'B', 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1, 10, 'C', 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1, 11, 'A', 0, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1, 12, 'C', 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1, 13, 'B', 1, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(1, 14, 'B', 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 15, 'C', 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 16, 'B', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 5, 'C', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 8, 'B', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 11, 'B', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, 'A', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 4, 'B', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 3, 'A', 0, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 5, 'B', 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 7, 'B', 0, DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO weak_points (user_id, subject_id, accuracy, total_answers) VALUES
(1, 2, 66.7, 3),
(1, 3, 66.7, 3),
(1, 4, 66.7, 3),
(1, 5, 50.0, 2),
(1, 6, 100.0, 1),
(1, 7, 100.0, 3),
(2, 2, 100.0, 1),
(2, 3, 100.0, 1),
(4, 3, 0.0, 1),
(4, 4, 0.0, 1);

INSERT INTO progress (user_id, record_date, study_minutes, completed_items, answer_count)
SELECT
    1,
    DATE_SUB(CURDATE(), INTERVAL n DAY),
    75 + (n * 11) % 80,
    3 + (n % 3),
    1 + (n % 2)
FROM (
    SELECT 13 AS n UNION SELECT 12 UNION SELECT 11 UNION SELECT 10 UNION SELECT 9
    UNION SELECT 8 UNION SELECT 7 UNION SELECT 6 UNION SELECT 5 UNION SELECT 4
    UNION SELECT 3 UNION SELECT 2 UNION SELECT 1
) days;

INSERT INTO progress (user_id, record_date, study_minutes, completed_items, answer_count) VALUES
(1, CURDATE(), 90, 2, 2),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 60, 1, 2);

INSERT INTO comments (question_id, user_id, content, reply_to, created_at) VALUES
(1, 1, '“甘拜下风”和“甘败下风”总是搞混，有什么记忆技巧吗？', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 2, '可以记“拜”有拜服、认输的意思，输了才拜。', 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 1, '行程问题第二次相遇还是不太会，能讲讲画图步骤吗？', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 1, '逻辑题按形式选 A，但感觉和常识矛盾，考试到底怎么选？', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(14, 1, '申论大作文开头有没有万能模板？', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));