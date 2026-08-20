const jwt = require("jsonwebtoken");
const Ably = require("ably");
const { getDb, initDb } = require("./db");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = "tagarela_secret_2025_xyz";
const ABLY_KEY = "jENcFQ.LMallg:Hi4c-eh2WQeFoslmpF-NC8ndqIR8lv9b7MNaeQ9d8BU";

function getUser(event) {
  try { return jwt.verify((event.headers.authorization || "").replace("Bearer ", ""), JWT_SECRET); }
  catch { return null; }
}

exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    await initDb();
    const db = getDb();
    const user = getUser(event);
    if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: "Não autenticado" }) };
    const params = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};

    if (event.httpMethod === "GET" && params.action === "all") {
      const result = await db.execute("SELECT id,username,email,avatar_color,is_premium,is_admin,premium_until,created_at FROM users ORDER BY created_at DESC");
      return { statusCode: 200, headers, body: JSON.stringify({ users: result.rows }) };
    }

    if (event.httpMethod === "GET" && params.action === "notifications") {
      const result = await db.execute({ sql: "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30", args: [user.id] });
      return { statusCode: 200, headers, body: JSON.stringify({ notifications: result.rows }) };
    }

    if (event.httpMethod === "POST" && body.action === "mark_read") {
      await db.execute({ sql: "UPDATE notifications SET read=1 WHERE user_id=?", args: [user.id] });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === "POST" && body.action === "follow") {
      const { target_id } = body;
      const existing = await db.execute({ sql: "SELECT id FROM follows WHERE follower_id=? AND following_id=?", args: [user.id, target_id] });
      if (existing.rows.length) {
        await db.execute({ sql: "DELETE FROM follows WHERE follower_id=? AND following_id=?", args: [user.id, target_id] });
        await db.execute({ sql: "UPDATE users SET total_followers=MAX(0,total_followers-1) WHERE id=?", args: [target_id] });
        return { statusCode: 200, headers, body: JSON.stringify({ following: false }) };
      } else {
        await db.execute({ sql: "INSERT INTO follows (id,follower_id,following_id) VALUES (?,?,?)", args: [uuidv4(), user.id, target_id] });
        await db.execute({ sql: "UPDATE users SET total_followers=total_followers+1 WHERE id=?", args: [target_id] });
        await db.execute({ sql: "INSERT INTO notifications (id,user_id,type,from_user,from_color,message) VALUES (?,?,?,?,?,?)", args: [uuidv4(), target_id, "follow", user.username, "#7c6fff", `${user.username} começou a seguir-te!`] });
        const ably = new Ably.Rest(ABLY_KEY);
        await ably.channels.get(
