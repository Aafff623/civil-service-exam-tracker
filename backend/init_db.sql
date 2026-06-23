-- Database initialization script for civil-service-exam-tracker
-- SQLite

PRAGMA foreign_keys = ON;

-- Drop existing tables in reverse dependency order
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

-- Subjects / 考试科目
CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    weight REAL NOT NULL DEFAULT 1.0,
    difficulty REAL NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES subjects(id)
);

-- Users / 用户
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals / 学习目标
CREATE TABLE goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exam_type TEXT NOT NULL DEFAULT '国考',
    start_date DATE NOT NULL,
    exam_date DATE NOT NULL,
    daily_minutes INTEGER NOT NULL DEFAULT 120,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resources / 学习资源
CREATE TABLE resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('大纲', '真题', '模拟题', '资料')),
    content TEXT,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Questions / 题目
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('单选', '多选', '判断')),
    content TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON array
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    tips TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Answers / 答题记录
CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct INTEGER NOT NULL CHECK(is_correct IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Plans / 学习计划
CREATE TABLE plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PlanItems / 每日计划项
CREATE TABLE plan_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    item_date DATE NOT NULL,
    content TEXT NOT NULL,
    suggested_minutes INTEGER NOT NULL DEFAULT 30,
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK(is_completed IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Progress / 学习进度（每日汇总）
CREATE TABLE progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    record_date DATE NOT NULL,
    study_minutes INTEGER NOT NULL DEFAULT 0,
    completed_items INTEGER NOT NULL DEFAULT 0,
    answer_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, record_date)
);

-- WeakPoints / 弱项统计
CREATE TABLE weak_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    accuracy REAL NOT NULL DEFAULT 0,
    total_answers INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE(user_id, subject_id)
);

-- Recommendations / 个性化推荐
CREATE TABLE recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('resource', 'question')),
    target_id INTEGER NOT NULL,
    reason TEXT,
    is_viewed INTEGER NOT NULL DEFAULT 0 CHECK(is_viewed IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments / 答疑留言
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    reply_to INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to) REFERENCES comments(id)
);

-- Indexes
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

-- Seed data: subjects
INSERT INTO subjects (id, name, parent_id, weight, difficulty) VALUES
(1, '行政职业能力测验', NULL, 1.2, 1.0),
(2, '言语理解与表达', 1, 1.0, 0.8),
(3, '数量关系', 1, 1.0, 1.3),
(4, '判断推理', 1, 1.1, 1.1),
(5, '资料分析', 1, 1.1, 1.0),
(6, '常识判断', 1, 0.9, 0.9),
(7, '申论', NULL, 1.3, 1.2);

-- Seed data: sample resources
INSERT INTO resources (subject_id, title, type, content) VALUES
(NULL, '2026 年国家公务员考试大纲', '大纲', '考试大纲内容...'),
(1, '2025 年国考行测真题', '真题', '2025 年国家公务员考试行政职业能力测验真题'),
(2, '言语理解高频成语 500 个', '资料', '高频成语及释义'),
(7, '申论写作模板与范文', '资料', '常见申论题型写作框架');

-- Seed data: sample questions
INSERT INTO questions (subject_id, type, content, options, correct_answer, explanation, tips) VALUES
(2, '单选', '下列词语中，没有错别字的一项是：', '["A. 甘拜下风", "B. 甘败下风", "C. 甘拜下风", "D. 甘败下风"]', 'A', '正确写法是“甘拜下风”。', '注意“拜”是拜服的意思。'),
(3, '单选', '1, 3, 5, 7, ?', '["A. 8", "B. 9", "C. 10", "D. 11"]', 'B', '奇数序列，下一个是 9。', '观察数字规律。'),
(4, '单选', '所有的鸟都会飞。企鹅是鸟。所以：', '["A. 企鹅会飞", "B. 企鹅不会飞", "C. 所有鸟都不会飞", "D. 无法判断"]', 'B', '前提为假命题，但按逻辑推导，企鹅会飞；实际上企鹅不会飞，说明前提错误。考试中按逻辑形式选 A。', '注意逻辑推理与常识的区别。'),
(7, '单选', '申论文章的核心要求是：', '["A. 辞藻华丽", "B. 观点明确、论证充分", "C. 篇幅越长越好", "D. 多用修辞手法"]', 'B', '申论重在观点明确、论证充分、结构清晰。', '紧扣材料，结构清晰。');
