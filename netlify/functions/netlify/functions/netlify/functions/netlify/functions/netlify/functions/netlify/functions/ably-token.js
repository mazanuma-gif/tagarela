const Ably = require("ably");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "tagarela_secret_2025_xyz";
const ABLY_KEY = "jENcFQ.LMallg:Hi4c-eh2WQeFoslmpF-NC8ndqIR8lv9b7MNaeQ9d8BU";

exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Allow-Methods": "GET,OPTIONS", "Content-Type": "application/json" };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  try {
    const token = (event.headers.authorization || "").replace("Bearer ", "");
    const user = jwt.verify(token, JWT_SECRET);
    const ably = new Ably.Rest(ABLY_KEY);
    const tokenRequest = await ably.auth.createTokenRequest({ clientId:
