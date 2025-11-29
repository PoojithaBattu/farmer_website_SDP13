# FarmValue - Server Setup Guide

## Overview
The app now uses a Node.js backend with JSON file storage for persistent data across server restarts.

## How It Works
- **Backend Server**: Express.js server running on port 3001
- **Data Storage**: All users, products, and orders stored in `data.json` file
- **Frontend**: React app running on port 5173 (Vite default)

## Running the Application

### Option 1: Run Both Together (Recommended)
```bash
npm run dev:all
```
This starts both the backend server and frontend dev server simultaneously.

### Option 2: Run Separately
Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## Data Persistence
- User accounts created via signup are saved to `data.json`
- Products, orders, and all app data persist in `data.json`
- Even if you stop and restart the server, all data remains

## Demo Accounts
- **Admin**: admin@farmvalue.com / admin123
- **Farmer**: ravi@farm.com / farmer123
- **Buyer**: asha@buyer.com / buyer123

## API Endpoints
- `GET /api/data` - Get all app data
- `POST /api/data` - Save all app data
- `POST /api/login` - Login with email/password
- `POST /api/signup` - Create new user account

## File Structure
```
my-farm-app/
├── server.js          # Backend API server
├── data.json          # Persistent data storage (auto-created)
├── src/
│   └── App.jsx        # Frontend app (uses API)
└── package.json       # Dependencies and scripts
```

## Notes
- `data.json` is in `.gitignore` to avoid committing user data
- The file is automatically created on first server start
- Backend must be running for login/signup to work
