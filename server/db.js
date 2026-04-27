const { Low, JSONFile } = require('lowdb');
const path = require('path');
const fs = require('fs');

const file = path.join(__dirname, 'data.json');
if (!fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify({ lastId: 0, users: [] }, null, 2));
}

const adapter = new JSONFile(file);
const db = new Low(adapter);

async function _init() {
  await db.read();
  db.data = db.data || { lastId: 0, users: [] };
}

// Initialize immediately (fire-and-forget)
_init().catch(err => console.error('lowdb init error', err));

function getUserByEmail(email) {
  return db.data.users.find(u => u.email === email);
}

function createUser({ name, email, password }) {
  const id = ++db.data.lastId;
  const user = { id, name, email, password, created_at: new Date().toISOString() };
  db.data.users.push(user);
  db.write();
  return user;
}

function getUserById(id) {
  return db.data.users.find(u => u.id === id);
}

module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
  _raw: db
};
