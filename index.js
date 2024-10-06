const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;
const cors = require('cors');
const users = []; // This is just an in-memory store, should be replaced with a database in production.
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173',  // Allow only your React app to access
  }));
  

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store user (In a real app, you'd save this to the DB)
  users.push({ username, password: hashedPassword });
  res.status(201).send({ message: 'User registered successfully!' });
  setTimeout(() => {
    console.log(users);
  }, 100);
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(403).send({ message: 'Invalid credentials' });
  }

  // Generate a JWT token
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.send({ token });
});

// Protected route
app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).send({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ message: 'Invalid token' });
    }
    res.send({ message: 'Protected data', user });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
