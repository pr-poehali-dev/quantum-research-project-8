import json
import os
import hashlib
import secrets
import psycopg2

ADMIN_ID = "620899"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token(user_id: str) -> str:
    return hashlib.sha256(f"{user_id}:{secrets.token_hex(16)}".encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Регистрация и вход пользователей"""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action")
    conn = get_conn()
    cur = conn.cursor()

    # Регистрация
    if action == "register":
        username = (body.get("username") or "").strip()
        password = body.get("password") or ""
        nickname = body.get("nickname") or username

        if not username or not password:
            conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Введи логин и пароль"})}

        if len(username) < 3:
            conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Логин минимум 3 символа"})}

        if len(password) < 4:
            conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Пароль минимум 4 символа"})}

        cur.execute("SELECT id FROM profiles WHERE username = %s", (username,))
        if cur.fetchone():
            conn.close()
            return {"statusCode": 409, "headers": headers, "body": json.dumps({"error": "Логин уже занят"})}

        user_id = str(100000 + abs(hash(username)) % 900000)
        cur.execute("SELECT id FROM profiles WHERE id = %s", (user_id,))
        if cur.fetchone():
            user_id = str(100000 + abs(hash(username + password)) % 900000)

        pw_hash = hash_password(password)
        token = make_token(user_id)
        is_admin = user_id == ADMIN_ID

        cur.execute("""
            INSERT INTO profiles (id, username, nickname, balance, privileges, avatar, is_admin, password_hash)
            VALUES (%s, %s, %s, 100, '{}', '', %s, %s)
        """, (user_id, username, nickname, is_admin, pw_hash))
        conn.commit()
        conn.close()

        return {"statusCode": 200, "headers": headers, "body": json.dumps({
            "ok": True, "token": token, "id": user_id,
            "nickname": nickname, "username": username,
            "balance": 100, "privileges": [], "avatar": "", "is_admin": is_admin
        })}

    # Вход
    if action == "login":
        username = (body.get("username") or "").strip()
        password = body.get("password") or ""

        if not username or not password:
            conn.close()
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Введи логин и пароль"})}

        pw_hash = hash_password(password)
        cur.execute("""
            SELECT id, username, nickname, balance, privileges, avatar, is_admin
            FROM profiles WHERE username = %s AND password_hash = %s
        """, (username, pw_hash))
        row = cur.fetchone()
        conn.close()

        if not row:
            return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Неверный логин или пароль"})}

        token = make_token(row[0])
        return {"statusCode": 200, "headers": headers, "body": json.dumps({
            "ok": True, "token": token,
            "id": row[0], "username": row[1], "nickname": row[2],
            "balance": row[3], "privileges": list(row[4] or []),
            "avatar": row[5], "is_admin": row[6]
        })}

    conn.close()
    return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Неверный запрос"})}
