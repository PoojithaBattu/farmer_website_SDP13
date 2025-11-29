// Simple Express server for FarmValue app
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [
        { id: 'u_admin', role: 'admin', name: 'Admin', email: 'admin@farmvalue.com', password: 'admin123' },
        { id: 'u_farmer1', role: 'farmer', name: 'Farmer Ravi', email: 'ravi@farm.com', password: 'farmer123' },
        { id: 'u_buyer1', role: 'buyer', name: 'Buyer Asha', email: 'asha@buyer.com', password: 'buyer123' }
      ],
      products: [],
      orders: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Read data from file
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return null;
  }
}

// Write data to file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Initialize data file on startup
initDataFile();

// API Routes

// Get all data
app.get('/api/data', (req, res) => {
  const data = readData();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Save all data
app.post('/api/data', (req, res) => {
  const success = writeData(req.body);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const data = readData();
  
  const user = data.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
});

// Signup
app.post('/api/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  const data = readData();
  
  // Check if email already exists
  if (data.users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, error: 'Email already registered' });
  }
  
  // Create new user
  const newUser = {
    id: 'u_' + Date.now(),
    name,
    email,
    password,
    role
  };
  
  data.users.push(newUser);
  
  if (writeData(data)) {
    res.json({ success: true, user: newUser });
  } else {
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

app.listen(PORT, () => {
  console.log(`FarmValue API server running on http://localhost:${PORT}`);
});
