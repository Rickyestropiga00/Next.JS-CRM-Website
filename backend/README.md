# Next.js CRM Backend

A robust Node.js backend API for the Next.js CRM application built with Express, TypeScript, and MongoDB.

## Features

- 🚀 **Express.js** - Fast, minimalist web framework
- 📘 **TypeScript** - Type-safe JavaScript development
- 🛡️ **Security** - Helmet, CORS, rate limiting
- 📊 **MongoDB** - Database with Mongoose ODM
- 🔐 **Authentication** - JWT-based auth system
- 📝 **Logging** - Morgan HTTP request logger
- ⚡ **Hot Reload** - tsx for development
- 🔍 **Linting** - ESLint with TypeScript support

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp env.template .env
```

4. Update the `.env` file with your configuration values.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## Development

1. Start MongoDB (if running locally)
2. Copy and configure your environment variables
3. Run the development server:

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api` - API information and available endpoints

### Planned Endpoints

- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/customers` - Customer management
- `/api/products` - Product catalog
- `/api/orders` - Order management
- `/api/agents` - Agent management
- `/api/tasks` - Task management
- `/api/analytics` - Analytics and reporting

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript (generated)
├── .env                 # Environment variables (create from template)
├── env.template         # Environment variables template
└── package.json         # Dependencies and scripts
```

## Environment Variables

See `env.template` for all available configuration options. Key variables include:

- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend application URL for CORS

## Contributing

1. Follow TypeScript best practices
2. Use ESLint for code quality
3. Write descriptive commit messages
4. Test your changes thoroughly

## License

This project is part of the Next.js CRM application.
