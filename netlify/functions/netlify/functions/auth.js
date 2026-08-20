const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb, initDb } = require("./db");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = "tagarela_secret_2025_xyz";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    await initDb();
    const db = getDb();
    const { action, email, password, username } = JSON.parse(event.body || "{}");

    if (action === "register") {
      if (!username || !email || !password) return { statusCode: 400, headers, body: JSON.stringify({ error: "Preenche todos os campos" }) };
      if (password.length < 6) return { statusCode: 400, headers, body: JSON.stringify({ error: "Senha precisa de ter pelo menos 6 caracteres" }) };

      const existing = await db.execute({ sql: "SELECT id FROM users WHERE email=? OR username=?", args: [email, username] });
      if (existing.rows.length > 0) return { statusCode: 400, headers, body: JSON.stringify({ error: "Email ou nome de utilizador já existe" }) };

      const colors = ['#7c6fff','#ff6b9d','#4ade80','#fb923c','#38bdf8','#f472b6'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const hash = await bcrypt.hash(password, 10);
      const id = uuidv4();

      await db.execute({ sql: "INSERT INTO users (id,username,email,password,avatar_color) VALUES (?,?,?,?,?)", args: [id, username, email, hash, color] });
      const token = jwt.sign({ id, username, email, color }, JWT_SECRET, { expiresIn: "30d" });
      return { statusCode: 200, headers, body: JSON.stringify({ token, user: { id, username, email, avatar_color: color } }) };
    }
