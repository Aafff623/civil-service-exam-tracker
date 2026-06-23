# Issue 01 — Backend resource API

Status: closed

## Goal

Implement backend API endpoints for listing and viewing learning resources.

## Acceptance criteria

- [ ] `GET /api/resources` returns a paginated list of resources
- [ ] Supports filtering by `subject_id` and `type`
- [ ] `GET /api/resources/<id>` returns resource details
- [ ] Returns subject name alongside resource data
- [ ] All endpoints require authentication
- [ ] All endpoints return `{success, data, message}` format

## Dependencies

- Database schema (`init_db.sql`)
- User authentication module (for session check)

## API contracts

### GET /api/resources

Query params:
- `subject_id` (optional)
- `type` (optional): 大纲 | 真题 | 模拟题 | 资料

Success 200:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "2026 年国家公务员考试大纲",
        "type": "大纲",
        "subject_id": null,
        "subject_name": null,
        "content": "考试大纲内容...",
        "created_at": "2026-06-23 08:00:00"
      }
    ]
  },
  "message": ""
}
```

### GET /api/resources/1

Success 200:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "...",
    "type": "...",
    "subject_name": "...",
    "content": "..."
  },
  "message": ""
}
```

## Out of scope

- Resource upload/create by users
- File upload
- Search/full-text
