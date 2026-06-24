# Week 1 建议截图清单

## 1. 登录页

- **位置**：`frontend/login.html`（浏览器访问 `http://localhost:8080/login.html`）
- **描述**：左侧品牌面板（logo + 标题「把备考进度放在看得见的地方」+ 核心能力标签 + 用户反馈引用）+ 右侧登录表单（用户名/密码输入框 + 登录按钮 + 演示账号折叠面板）
- **用途**：展示前端设计资产集成效果、用户体验设计、演示账号便利性
- **截图时机**：页面加载完成后，无需登录

## 2. 注册页

- **位置**：`frontend/register.html`（浏览器访问 `http://localhost:8080/register.html`）
- **描述**：与登录页统一的左右分栏布局，左侧「创建账号 开始记录学习」+ 右侧注册表单（用户名/密码 + 密码至少 6 位提示）
- **用途**：展示注册流程、表单验证、页面风格一致性
- **截图时机**：页面加载完成后

## 3. 资源库页

- **位置**：`frontend/resources.html`（登录后访问）
- **描述**：顶部标签页（考试大纲/历年试题/备考资料/政策公告）+ 搜索框 + 科目筛选标签 + 资源卡片网格（标题、类型标签、科目、关联题目数）+ 底部公告列表 + 管理员入口
- **用途**：展示资源分类、筛选功能、卡片布局、管理员权限入口
- **截图时机**：登录后，资源列表加载完成

## 4. 资源详情页

- **位置**：`frontend/resource-detail.html`（点击资源卡片进入）
- **描述**：资源标题、类型标签（如「真题」）、科目名称、内容摘要、关联题目数量、返回按钮
- **用途**：展示资源详情展示、资源与题目的关联关系
- **截图时机**：点击任意资源卡片后

## 5. 数据库表结构（ER 图）

- **位置**：MySQL Workbench 或 DataGrip 等 IDE 的 ER 图视图
- **描述**：12 张表的实体关系图，突出 users、resources、subjects、questions 等 Week 1 核心表
- **用途**：PPT 数据库设计页的核心视觉素材
- **截图时机**：从 IDE 导出或截图
- **替代方案**：如无可视化工具，可截图 `frontend/assets/init_db.sql` 中 CREATE TABLE 部分代码

## 6. init_db.py 执行终端

- **位置**：PowerShell / CMD 终端
- **描述**：执行 `cd backend && python init_db.py` 后的输出，显示 "Initialized MySQL database: civil_service_exam on localhost:3306"
- **用途**：展示一键数据库初始化能力，体现部署便利性
- **截图时机**：命令执行成功后

## 7. API 测试（Postman / 浏览器 DevTools）

- **位置**：浏览器 DevTools Network 面板 或 Postman
- **描述**：调用 `POST /api/auth/login` 返回 JSON：`{ "success": true, "data": { "id": 1, "username": "root" }, "message": "Login successful" }`
- **用途**：展示 API 连通性、统一响应格式
- **截图时机**：登录成功后

## 8. 项目目录结构

- **位置**：VS Code 资源管理器 或 文件管理器
- **描述**：清晰展示 `backend/`（app.py、routes/、config.py、db.py）和 `frontend/`（*.html、js/、assets/）分层
- **用途**：展示项目骨架清晰、前后端分离
- **截图时机**：任意时刻

## 9. 资源管理后台（管理员视图）

- **位置**：`frontend/resources.html` 底部「资源管理入口」卡片
- **描述**：管理员登录后显示「上传资源」「新建分类」「批量管理」三个按钮，普通用户不显示或显示提示
- **用途**：展示 RBAC 权限控制、管理员功能
- **截图时机**：用 root 账号登录后访问资源页

## 10. 数据库种子数据（SQL 片段）

- **位置**：`frontend/assets/init_db.sql` 编辑器视图
- **描述**：展示 resources 表的 INSERT 语句片段（23 条资源数据）
- **用途**：PPT 中展示数据规模、资源类型分布
- **截图时机**：任意时刻
