# Musafir Buddy — Backend

Scalable REST API foundation built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**.

## Architecture Overview

```text
Backend/
├── src/
│   ├── config/          # Configuration files (DB connection)
│   ├── controllers/     # Route request handlers
│   ├── middleware/      # Global & custom middlewares (Error, Auth)
│   ├── models/          # Mongoose data schemas (Future models)
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic services
│   ├── utils/           # Helper utilities
│   └── server.js        # Express application entry point
├── .env                 # Environment variables (Local dev)
├── .env.example         # Environment template
├── .gitignore           # Git ignore rules
└── package.json         # Project dependencies & scripts
```

## Quick Start

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

Default variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/musafir_buddy
JWT_SECRET=your_jwt_secret
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Production Server
```bash
npm start
```

## Available API Endpoints

### Health Check
- `GET /api/health` - Check API and server status

```json
{
  "success": true,
  "message": "Musafir Buddy API is running",
  "environment": "development",
  "timestamp": "2026-08-22T09:50:00.000Z"
}
```
