const jwt = require("jsonwebtoken");
const Ably = require("ably");
const { getDb, initDb } = require("./db");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = "tagarela_secret_2025_xyz";
const ABLY_KEY = "jENcFQ.LMallg:Hi4c-eh2WQeFoslmpF-NC8ndqIR8lv9b7MNaeQ9d8BU";

function getUser(event) {
  try {
    const token = (event.headers.authorization || "").replace("Bearer ", "");
    return jwt.verify(token, JWT_SECRET);
  } catch { return null; }
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    await initDb();
    const db = getDb();
    const user = getUser(event);
    if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: "Não autenticado" }) };

    const params = event.queryStringParameters || {};

    if (event.httpMethod === "GET") {
      const channel =
