const jwt = require('jsonwebtoken');

function getConfiguredUsers() {
  return [
    { email: process.env.USER1_EMAIL, password: process.env.USER1_PASSWORD },
    { email: process.env.USER2_EMAIL, password: process.env.USER2_PASSWORD },
  ].filter((user) => user.email && user.password);
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = getConfiguredUsers();
  const matchedUser = users.find((user) => user.email === email && user.password === password);

  if (!matchedUser) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '12h' });

  return res.json({ token, email });
}

module.exports = { login };