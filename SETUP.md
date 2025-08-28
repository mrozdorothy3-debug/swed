# 🚀 Atlas Insurance - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

## MongoDB Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended for Development)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Create a `.env` file in the `server/` directory with:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

### Option 2: Local MongoDB Installation
1. Download and install MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Create a `.env` file in the `server/` directory with:
   ```
   MONGODB_URI=mongodb://localhost:27017/atlas_insurance
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

2. **Set up environment variables** (see MongoDB setup options above)

3. **Seed the database:**
   ```bash
   cd server
   npm run seed
   cd ..
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

## Default Accounts

After running the seed script, you'll have these default accounts:

- **👑 Admin:** admin@atlasinsurance.com / admin123
- **👨‍💼 Agent:** agent@atlasinsurance.com / agent123  
- **👤 Customer:** customer@atlasinsurance.com / customer123

## Development

- **Frontend:** http://localhost:3000 (React)
- **Backend:** http://localhost:5000 (Express API)
- **API Docs:** http://localhost:5000

## Available Scripts

- `npm run dev` - Start both client and server
- `npm run dev:client` - Start only React client
- `npm run dev:server` - Start only Express server
- `npm run seed` - Seed database with sample data

## Project Structure

```
atlas-insurance/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── App.css        # Custom styles
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                 # Express backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication & authorization
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── seeders/           # Database seeding
│   └── index.js           # Server entry point
└── package.json           # Root package.json
```

## Features

- 🔐 **Authentication System** - JWT-based login/registration
- 👥 **Role-Based Access Control** - Admin, Agent, Customer roles
- 📋 **Policy Management** - Create, update, and manage insurance policies
- 📋 **Claims Processing** - File and track insurance claims
- 📊 **Dashboard** - Role-specific dashboards with analytics
- 🎨 **Modern UI/UX** - Professional insurance website design
- 🗄️ **MongoDB Database** - Persistent data storage
- 🔒 **Security** - Password hashing, rate limiting, CORS

## Troubleshooting

### Port Conflicts
If you get port conflicts, modify the port in `client/package.json`:
```json
"start": "set PORT=3001 && react-scripts start"
```

### MongoDB Connection Issues
- Check your connection string in `.env`
- Ensure MongoDB service is running (for local installation)
- Check network access (for Atlas)

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
