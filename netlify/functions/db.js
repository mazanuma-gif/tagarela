const { createClient } = require("@libsql/client");

let client = null;

function getDb() {
  if (!client) {
    client = createClient({
      url: "libsql://tagarela-mazanuma.aws-us-east-1.turso.io",
      authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODcxMjk4MzIsImlkIjoiMDFhMDE5MzgtMzUwMS03OWM0LWI3NmEtNGJhYThmNjJhOTU5Iiwia2lkIjoiaUV3R3pienlISjVuMklQOE5adHFCQWptREx4YjVqU0ZjZHcxdnp1YXhUMCIsInJpZCI6IjNlMzM1OWE3LThlYTMtNDZlZC1iMzUwLTlkM2IxYzE3MDlhNiJ9.71PiTks0Y49aPZtQP5VQFAGOgXMyvUX3rX4a66DiNaCxxS9nO1xXX2h4Nz9bZ_rjAXkdURg43OZ6sgqoMVbSAQ"
    });
  }
  return client;
}

async function initDb() {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar_color TEXT DEFAULT '#7c6fff',
      is_premium INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      premium_until TEXT,
      total_followers INTEGER DEFAULT 0,
      total_audience INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      avatar_color TEXT,
      content TEXT,
      media_type TEXT,
      media_url TEXT,
      reply_to_id TEXT,
      reply_to_name TEXT,
      reply_to_content TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
