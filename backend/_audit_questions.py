import pymysql
from config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

conn = pymysql.connect(
    host=MYSQL_HOST,
    port=MYSQL_PORT,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    database=MYSQL_DATABASE,
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor,
)
cur = conn.cursor()

print('=== questions by subject + type ===')
cur.execute(
    """
    SELECT s.name, q.subject_id, q.type, COUNT(*) AS c
    FROM questions q
    JOIN subjects s ON s.id = q.subject_id
    GROUP BY q.subject_id, q.type
    ORDER BY q.subject_id, q.type
    """
)
for r in cur.fetchall():
    print(r)

print('\n=== questions by resource ===')
cur.execute(
    """
    SELECT r.id, r.title, r.type, r.subject_id, COUNT(q.id) AS c
    FROM resources r
    LEFT JOIN questions q ON q.resource_id = r.id
    GROUP BY r.id
    ORDER BY r.id
    """
)
for r in cur.fetchall():
    print(r)

print('\n=== practice resources with 0 questions ===')
cur.execute(
    """
    SELECT id, title, type, subject_id
    FROM resources
    WHERE type IN ('真题', '模拟题', '资料')
      AND id NOT IN (
          SELECT DISTINCT resource_id FROM questions WHERE resource_id IS NOT NULL
      )
    """
)
for r in cur.fetchall():
    print(r)

print('\n=== totals ===')
cur.execute('SELECT COUNT(*) AS n FROM questions')
print('questions', cur.fetchone()['n'])
cur.execute('SELECT type, COUNT(*) AS c FROM questions GROUP BY type')
for r in cur.fetchall():
    print('qtype', r)

conn.close()