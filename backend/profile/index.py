import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

ADMIN_ID = "620899"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """Управление профилями: получить, сохранить, перевести баланс"""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    method = event.get("httpMethod")
    params = event.get("queryStringParameters") or {}
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor()

    # GET /profile?id=123456 — получить профиль
    if method == "GET":
        pid = params.get("id")
        if not pid:
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "no id"})}
        cur.execute("SELECT id, nickname, balance, privileges, avatar, is_admin FROM profiles WHERE id = %s", (pid,))
        row = cur.fetchone()
        if not row:
            return {"statusCode": 404, "headers": headers, "body": json.dumps({"error": "not found"})}
        conn.close()
        return {"statusCode": 200, "headers": headers, "body": json.dumps({
            "id": row[0], "nickname": row[1], "balance": row[2],
            "privileges": list(row[3] or []), "avatar": row[4], "is_admin": row[5]
        })}

    # POST /profile action=upsert — создать/обновить профиль
    if method == "POST":
        action = body.get("action")

        if action == "upsert":
            pid = body.get("id")
            nickname = body.get("nickname", "")
            balance = body.get("balance", 100)
            privileges = body.get("privileges", [])
            avatar = body.get("avatar", "")
            is_admin = pid == ADMIN_ID
            cur.execute("""
                INSERT INTO profiles (id, nickname, balance, privileges, avatar, is_admin)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    nickname = EXCLUDED.nickname,
                    balance = EXCLUDED.balance,
                    privileges = EXCLUDED.privileges,
                    avatar = EXCLUDED.avatar
            """, (pid, nickname, balance, privileges, avatar, is_admin))
            conn.commit()
            conn.close()
            return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}

        if action == "transfer":
            from_id = body.get("from_id")
            to_id = body.get("to_id")
            amount = int(body.get("amount", 0))

            if from_id != ADMIN_ID:
                conn.close()
                return {"statusCode": 403, "headers": headers, "body": json.dumps({"error": "forbidden"})}

            cur.execute("SELECT balance FROM profiles WHERE id = %s", (to_id,))
            row = cur.fetchone()
            if not row:
                conn.close()
                return {"statusCode": 404, "headers": headers, "body": json.dumps({"error": "recipient not found"})}

            cur.execute("UPDATE profiles SET balance = balance + %s WHERE id = %s", (amount, to_id))
            conn.commit()
            conn.close()
            return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "bad request"})}