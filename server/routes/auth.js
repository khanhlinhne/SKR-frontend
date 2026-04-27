const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// helper
function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', async (req, res) => {
  const { name, email, password, acceptedTerms } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  if (!acceptedTerms) return res.status(400).json({ message: 'Bạn phải đồng ý với Điều khoản và Chính sách bảo mật' });
  if (!email.toLowerCase().endsWith('@gmail.com')) return res.status(400).json({ message: 'Email phải là Gmail (@gmail.com)' });
  if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });

  try {
    const exists = db.getUserByEmail(email);
    if (exists) return res.status(409).json({ message: 'Email đã được sử dụng' });

    const hash = await bcrypt.hash(password, 10);
    const user = db.createUser({ name, email, password: hash });
    const token = createToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu' });

  try {
    const userRow = db.getUserByEmail(email);
    if (!userRow) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const ok = await bcrypt.compare(password, userRow.password);
    if (!ok) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const user = { id: userRow.id, name: userRow.name, email: userRow.email };
    const token = createToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// auth middleware
function authMiddleware(req, res, next) {
  const auth = (req.headers.authorization || '').split(' ');
  if (auth[0] !== 'Bearer' || !auth[1]) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(auth[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}

router.get('/me', authMiddleware, (req, res) => {
  const userRow = db.getUserById(req.user.id);
  if (!userRow) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  res.json({ user: { id: userRow.id, name: userRow.name, email: userRow.email, created_at: userRow.created_at } });
});

module.exports = router;
